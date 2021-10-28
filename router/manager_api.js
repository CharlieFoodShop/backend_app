// Load all packages
const express = require('express');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const sendMessage = require('./shared_function/sendMessage');
const authenticate_captcha = require('./shared_function/authenticate_captcha');
const uploadImage = require('./shared_function/uploadImage');
const { encrypt, decrypt } = require('./shared_function/encrypt-decrypt');

// Load Models
const Manager = require('./models/Manager');
const ManagerResetPasswordToken = require('./models/ManagerResetPasswordToken');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();

router.post('/manager_register', authenticate_captcha, async (req, res) => {
    try {

        // Validate If input existed
        if (!(
            req.body.first_name &&
            req.body.last_name &&
            req.body.email_address &&
            req.body.phone &&
            req.body.password
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the registration form!" });

        // Validate If email or phone number is legal
        if (!(validator.isEmail(req.body.email_address) && validator.isMobilePhone(req.body.phone, ['en-CA'])))
            return res.status(400).json({ success: false, message: 'Invalid email address or phone number!' });

        // Check If password is strong enough
        if (!validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }))
            return res.status(400).json({
                success: false,
                message: `Invalid password, password should be at least 8 characters, with 1 Uppercase, 1 Lowercase, 1 Number and 1 Symbol.`
            });

        // Validate If email or phone is taken
        const result = await Manager.checkManagerExisted(req.body.email_address, req.body.phone);
        if (result.success)
            return res.status(400).json({
                success: false, message: `Sorry, this email address or phone number has already be taken!`
            });

        // Create hash for password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(req.body.password, salt);

        // Add to database
        let insert_result = await Manager.insertNewManagerToDatabase(req.body.first_name,
            req.body.last_name,
            req.body.email_address,
            req.body.phone,
            password_hash,
            getTimestamp(),
            getTimestamp()
        );
        if (insert_result) {
            return res.status(201).json({ success: true, message: 'Registration Successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to registration. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_login', authenticate_captcha, async (req, res) => {
    try {
        // Validate If input existed
        if (!(
            req.body.email_address &&
            req.body.password
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the login form!" });

        // Find user in database
        let login_result = await Manager.checkManagerExisted(req.body.email_address, null);

        // Check is user is existing or password is correct
        if (
            !login_result.success ||
            !(await bcrypt.compare(req.body.password, login_result.existing_employee.password_hash)))
            return res.status(401).json({ success: false, message: "Fail to log in, please check your credentials!" });
        // Set session
        let sessionId = Date.now();
        req.session.cookie.sessionId = sessionId;
        return res.status(201).json({ success: true, message: 'Log in successful!', sessionId: sessionId });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_logout', async (req, res) => {
    try {
        delete req.session.cookie.sessionId;
        return res.status(201).json({ success: true, message: 'Logout Successful!' })
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_password_reset', authenticate_captcha, async (req, res) => {
    try {
        // Check if email address is provided
        if (!req.body.email_address)
            return res.status(400).json({ success: false, message: 'Please provide your email address' });

        // Validate If email is existing in database
        const result = await Manager.checkManagerExisted(req.body.email_address, null);
        if (!result.success)
            return res.status(404).json({
                success: false, message: `Sorry, this email address doesn't existing!`
            });

        // Check if token already existing
        // If existing, then it will be used, 
        // otherwise a new one will be created, and stored
        let token = "";
        let existing_token = await ManagerResetPasswordToken.checkToken(null, result.existing_employee.manager_id);
        if (existing_token.success) {
            token = existing_token.token_info.token;
        } else {
            token = crypto.randomBytes(32).toString("hex");
            let add_token_result = await ManagerResetPasswordToken.addToken(result.existing_employee.manager_id, token);
            if (!add_token_result)
                return res.status(500).json({ success: false, message: "Sorry, fail to make token!" });
        }

        // Sending email
        let subject = "Read this email to reset your password";
        let text = "Please follow the link below to reset your password. \n" +
            config.url.manager_reset_password_url + token;
        await sendMessage(req.body.email_address, subject, text);

        return res.status(201).json({ success: true, message: "Your email has been sent!" });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_password_reset/:token', authenticate_captcha, async (req, res) => {
    try {

        // Check if password is given
        if (!req.body.password)
            return res.status(400).json({ success: false, message: "Password can not be empty!" });

        // Check If password is strong enough
        if (!validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }))
            return res.status(400).json({
                success: false,
                message: `Invalid password, password should be at least 8 characters, with 1 Uppercase, 1 Lowercase, 1 Number and 1 Symbol.`
            });

        // Check if token existing, then delete it
        let existing_token = await ManagerResetPasswordToken.checkToken(req.params.token, null);
        if (!existing_token.success)
            return res.status(404).json({ success: false, message: 'Invalid link or expired' });
        await ManagerResetPasswordToken.deleteToken(existing_token.token_info.token);

        // Update password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(req.body.password, salt);
        let reset_password_result = await Manager.emailResetPassword(existing_token.token_info.manager_id, password_hash);
        if (reset_password_result) {
            return res.status(201).json({ success: true, message: 'Reset password successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to reset password. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_update_account', async (req, res) => {
    try {
        if (!(
            req.body.client_id &&
            req.body.client_secret &&
            req.body.manager_id
        ))
            return res.status(400).json({ success: false, message: "Please complete account detail!" });

        let client_secret_hash = encrypt(req.body.client_secret)
        let result = await Manager.updateManagerAccount(req.body.client_id, client_secret_hash, req.body.manager_id);
        if (result) {
            return res.status(201).json({ success: true, message: 'Update Account Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update Account. 
            Please check any information you give.` });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_update_profile', async (req, res) => {
    try {
        if (!(
            req.body.first_name &&
            req.body.last_name &&
            req.body.old_email_address &&
            req.body.new_email_address &&
            req.body.old_phone &&
            req.body.new_phone &&
            req.body.password &&
            req.body.manager_id
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the required information!" });

        if (!(validator.isEmail(req.body.new_email_address) && validator.isMobilePhone(req.body.new_phone, ['en-CA'])))
            return res.status(400).json({ success: false, message: 'Invalid email address or phone number!' });

        if (!validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }))
            return res.status(400).json({
                success: false,
                message: `Invalid password, password should be at least 8 characters, with 1 Uppercase, 1 Lowercase, 1 Number and 1 Symbol.`
            });

        if (req.body.old_email_address !== req.body.new_email_address) {
            let result_c1 = await Manager.checkManagerExisted(req.body.new_email_address, null);
            if (result_c1.success)
                return res.status(400).json({
                    success: false, message: `Sorry, this email address or phone number has already be taken!`
                });
        }

        if (req.body.old_phone !== req.body.new_phone) {
            let result_c2 = await Manager.checkManagerExisted(null, req.body.new_phone);
            if (result_c2.success)
                return res.status(400).json({
                    success: false, message: `Sorry, this email address or phone number has already be taken!`
                });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(req.body.password, salt);

        let avatar_url = null;
        if (req.body.avatar_url) {
            avatar_url = req.body.avatar_url;
        }

        let updated_at = getTimestamp();

        let update_result = Manager.updateManagerProfile(
            req.body.first_name,
            req.body.last_name,
            req.body.new_email_address,
            req.body.new_phone,
            password_hash,
            avatar_url,
            updated_at,
            req.body.manager_id
        );

        if (update_result) {
            return res.status(201).json({ success: true, message: 'Update Successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to update. Please try again.' });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_upload_avatar', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'Please provide id' });
        }

        await uploadImage(req, res, 5, req.query.id, Manager.UpdateManagerAvatar);
        return;
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/manager_detail', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: 'Please provide email address.' });

        let results = await Manager.getManagerDetailByEmailAddress(req.query.email_address);
        if (results.length === 0) {
            return res.status(200).json({ success: false, message: 'Account is not exist.' });
        } else {
            let data = results[0];
            if (data.client_secret_hash) {
                data.client_secret = decrypt(data.client_secret_hash);
            } else {
                data.client_secret = null;
            }

            return res.status(200).json({ success: true, data: data });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;