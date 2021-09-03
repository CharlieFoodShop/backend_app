// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const Manager = require('./models/Manager');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();

// Export the router
module.exports = router;