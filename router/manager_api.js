// Load all packages
const express = require('express');
const validator = require('validator');
const bcrypt = require('bcrypt');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const Manager = require('./models/Manager');

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
            return res.json({ success: false, message: "Pleases complete the registration form!" });

        // Validate If email or phone number is legal
        if (!(validator.isEmail(req.body.email_address) && validator.isMobilePhone(req.body.phone, ['en-CA'])))
            return res.json({ success: false, message: 'Invalid email address or phone number!' });

        // Check If password is strong enough
        if (!validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }))
            return res.json({
                success: false,
                message: `Invalid password, password should be at least 8 characters, with 1 Uppercase, 1 Lowercase, 1 Number and 1 Symbol.`
            });

        // Validate If email or phone is taken
        const result = await Manager.checkManagerExisted(req.body.email_address, req.body.phone);
        if (result)
            return res.json({
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
            return res.json({ success: false, message: 'Sorry, fail to registration. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;