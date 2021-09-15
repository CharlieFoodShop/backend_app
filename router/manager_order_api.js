// Load all packages
const express = require('express');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const sendMessage = require('./shared_function/sendMessage');

// Load Models
const Manager = require('./models/Manager');
const ManagerResetPasswordToken = require('./models/ManagerResetPasswordToken');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();

// Export the router
module.exports = router;