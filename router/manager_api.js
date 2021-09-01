// Load all packages
const express = require('express');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const Manager = require('./models/Manager');
const ManagerResetPasswordToken = require('./models/ManagerResetPasswordToken');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();

router.post('/manager_register', async (req, res) => {
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

router.post('/manager_login', async (req, res) => {
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

router.post('/manager_password_reset', async (req, res) => {
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
        let transporter = nodemailer.createTransport({
            host: config.email_account.host,
            port: config.email_account.port,
            secure: true,
            auth: {
                user: config.email_account.user,
                pass: config.email_account.pass
            }
        });
        await transporter.sendMail({
            from: config.email_account.user,
            to: req.body.email_address,
            subject: "Read this email to reset your password",
            text: "Please follow the link below to reset your password. \n" +
                config.url.manager_reset_password_url + token
        });

        return res.status(201).json({ success: true, message: "Your email has been sent!" });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/manager_password_reset/:token', async (req, res) => {
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

// Export the router
module.exports = router;