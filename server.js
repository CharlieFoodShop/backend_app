// Load all package
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const session = require('express-session');
const config = require('./config');

// Import all router
const manager_api = require('./router/manager_api');
const manager_food_shop_api = require('./router/manager_food_shop_api');

// Setup all config
app.use(cors({
    origin: '*'
}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        secure: true,
        maxAge: 5184000000 // 2 months
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Setup all router
app.use('/manager_api', manager_api);
app.use('/manager_food_shop_api', manager_food_shop_api);

// Start server
app.listen(config.default_port,
    () => console.log('Server is running.'));