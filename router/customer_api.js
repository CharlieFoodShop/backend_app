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

// Load Models
const Customer = require('./models/Customer');
const CustomerResetPasswordToken = require('./models/CustomerResetPasswordToken');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();

router.post('/customer_register', authenticate_captcha, async (req, res) => {
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
        const result = await Customer.checkCustomerExisted(req.body.email_address, req.body.phone);
        if (result.success)
            return res.status(400).json({
                success: false, message: `Sorry, this email address or phone number has already be taken!`
            });

        // Create hash for password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(req.body.password, salt);

        // Add to database
        let insert_result = await Customer.insertNewCustomerToDatabase(req.body.first_name,
            req.body.last_name,
            password_hash,
            req.body.email_address,
            req.body.phone,
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

router.post('/customer_login', authenticate_captcha, async (req, res) => {
    try {
        // Validate If input existed
        if (!(
            req.body.email_address &&
            req.body.password
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the login form!" });

        // Find user in database
        let login_result = await Customer.checkCustomerExisted(req.body.email_address, null);

        // Check is user is existing or password is correct
        if (
            !login_result.success ||
            !(await bcrypt.compare(req.body.password, login_result.existing_customer.password_hash)))
            return res.status(401).json({ success: false, message: "Fail to log in, please check your credentials!" });
        // Set session
        let customerSessionId = Date.now();
        req.session.cookie.customerSessionId = customerSessionId;
        return res.status(201).json({ success: true, message: 'Log in successful!', customerSessionId: customerSessionId });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/customer_logout', async (req, res) => {
    try {
        req.session.cookie.customerSessionId;
        return res.status(201).json({ success: true, message: 'Logout Successful!' })
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/customer_password_reset', authenticate_captcha, async (req, res) => {
    try {
        // Check if email address is provided
        if (!req.body.email_address)
            return res.status(400).json({ success: false, message: 'Please provide your email address' });

        // Validate If email is existing in database
        const result = await Customer.checkCustomerExisted(req.body.email_address, null);
        if (!result.success)
            return res.status(404).json({
                success: false, message: `Sorry, this email address doesn't existing!`
            });

        // Check if token already existing
        // If existing, then it will be used, 
        // otherwise a new one will be created, and stored
        let token = "";
        let existing_token = await CustomerResetPasswordToken.checkToken(null, result.existing_customer.customer_id);
        if (existing_token.success) {
            token = existing_token.token_info.token;
        } else {
            token = crypto.randomBytes(32).toString("hex");
            let add_token_result = await CustomerResetPasswordToken.addToken(result.existing_customer.customer_id, token);
            if (!add_token_result)
                return res.status(500).json({ success: false, message: "Sorry, fail to make token!" });
        }

        // Sending email
        let subject = "Read this email to reset your password";
        let text = "Please follow the link below to reset your password. \n" +
            config.url.customer_reset_password_url + token;
        await sendMessage(req.body.email_address, subject, text);

        return res.status(201).json({ success: true, message: "Your email has been sent!" });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/customer_password_reset/:token', authenticate_captcha, async (req, res) => {
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
        let existing_token = await CustomerResetPasswordToken.checkToken(req.params.token, null);
        if (!existing_token.success)
            return res.status(404).json({ success: false, message: 'Invalid link or expired' });
        await CustomerResetPasswordToken.deleteToken(existing_token.token_info.token);

        // Update password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(req.body.password, salt);
        let reset_password_result = await Customer.customerResetPassword(existing_token.token_info.customer_id, password_hash);
        if (reset_password_result) {
            return res.status(201).json({ success: true, message: 'Reset password successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to reset password. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/customer_update_profile', async (req, res) => {
    try {
        if (!(
            req.body.first_name &&
            req.body.last_name &&
            req.body.old_email_address &&
            req.body.new_email_address &&
            req.body.old_phone &&
            req.body.new_phone &&
            req.body.password &&
            req.body.customer_id
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
            let result_c1 = await Customer.checkCustomerExisted(req.body.new_email_address, null);
            if (result_c1.success)
                return res.status(400).json({
                    success: false, message: `Sorry, this email address or phone number has already be taken!`
                });
        }

        if (req.body.old_phone !== req.body.new_phone) {
            let result_c2 = await Customer.checkCustomerExisted(null, req.body.new_phone);
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

        let update_result = Customer.updateCustomerProfile(
            req.body.first_name,
            req.body.last_name,
            password_hash,
            req.body.new_email_address,
            req.body.new_phone,
            avatar_url,
            updated_at,
            req.body.customer_id
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

router.post('/customer_upload_avatar', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'Please provide id' });
        }

        await uploadImage(req, res, 1, req.query.id, Customer.UpdateCustomerAvatar);
        return;
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/customer_detail', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: 'Please provide email address.' });

        let results = await Customer.getCustomerDetailByEmailAddress(req.query.email_address);
        if (results.length === 0) {
            return res.status(200).json({ success: false, message: 'Account is not exist.' });
        } else {
            let data = results[0];

            return res.status(200).json({ success: true, data: data });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;