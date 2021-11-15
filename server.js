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
const manager_food_item_api = require('./router/manager_food_item_api');
const manager_order_api = require('./router/manager_order_api');
const manager_comment_api = require('./router/manager_comment_api');

const customer_api = require('./router/customer_api');
const customer_food_shop_api = require('./router/customer_food_shop_api');
const customer_food_item_api = require('./router/customer_food_item_api');
const customer_order_api = require('./router/customer_order_api');
const customer_comment_api = require('./router/customer_comment_api');

const deliver_driver_api = require('./router/deliver_driver_api');
const customer_help_api = require('./router/customer_help_api');

// Setup all config
app.use(cors({
    credentials: true,
    origin: config.url.base_url
    //origin: '*'
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
app.use('/manager_food_item_api', manager_food_item_api);
app.use('/manager_order_api', manager_order_api);
app.use('/manager_comment_api', manager_comment_api);

app.use('/customer_api', customer_api);
app.use('/customer_food_shop_api', customer_food_shop_api);
app.use('/customer_food_item_api', customer_food_item_api);
app.use('/customer_order_api', customer_order_api);
app.use('/customer_comment_api', customer_comment_api);

app.use('/deliver_driver_api', deliver_driver_api);
app.use('/customer_help_api', customer_help_api);

// Start server
app.listen(config.default_port,
    () => console.log('Server is running.'));