// Load all package
const express = require('express');
const app = express();
const config = require('./config');

// Import all router
const test = require('./router/test');

// Setup all config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup all router
app.use('/test', test);

// Start server
app.listen(config.default_port,
    () => console.log('Server is running.'));