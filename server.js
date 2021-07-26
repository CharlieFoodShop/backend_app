// Load all package
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const config = require('./config');

// Import all router
const test = require('./router/test');
const manager_api = require('./router/manager_api');

// Setup all config
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Setup all router
app.use('/test', test);
app.use('/manager_api', manager_api);

// Start server
app.listen(config.default_port,
    () => console.log('Server is running.'));