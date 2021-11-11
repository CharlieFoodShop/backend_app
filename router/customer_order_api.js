// Load all packages
const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const { decrypt } = require('./shared_function/encrypt-decrypt');

// Load Models
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Customer = require('./models/Customer');

// Create express router, connect to database
const router = express.Router();

router.get('/get_current_orders', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: "Pleases provide user detail!" });

        let results = await Order.getCurrentOrders(req.query.email_address);
        return res.status(200).json({ success: true, data: results });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_order_history', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: "Pleases provide user detail!" });

        let results = await Order.getOrderHistory(req.query.email_address);
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_order_detail_by_order_id', async (req, res) => {
    try {
        if (!req.query.order_id)
            return res.status(400).json({ success: false, message: "Pleases provide order detail!" });

        let order_detail = await Order.getCustomerOrderDetailByOrderId(req.query.order_id);
        order_detail.total = order_detail.total / 100;
        order_detail.hst = order_detail.hst / 100;

        let order_items = await OrderItem.getCustomerOrderItemList(req.query.order_id);
        for (let i = 0; i < order_items.length; i++) {
            order_items[i].sub_total = order_items[i].sub_total / 100;
            order_items[i].food_price = order_items[i].food_price / 100;
        }
        order_detail.order_items = order_items;

        return res.status(200).json({ success: true, data: order_detail });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/create_order', async (req, res) => {
    try {
        if (!(
            req.body.email_address,
            req.body.item_list,
            req.body.hst
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let item_list = [...req.body.item_list];
        let total = req.body.hst;

        for (let i = 0; i < item_list.length; i++) {
            total += (item_list[i].food_price * item_list[i].quantity)
        }
        total = Math.round(total * 100) / 100;


        let client_key = await Order.getClientKeys(req.body.item_list[0].food_item_id);
        let client_id = client_key.client_id;
        let client_secret = decrypt(client_key.client_secret_hash);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: "USD",
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: total
                        }
                    }
                }
            }]
        });

        let environment = new paypal.core.SandboxEnvironment(client_id, client_secret);
        let client = new paypal.core.PayPalHttpClient(environment);
        let response = await client.execute(request);

        if (response.statusCode === 201) {
            return res.status(201).json({ success: true, id: response.result.id });
        } else {
            return res.status(500).json({ success: false, message: 'Fail to create order' });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_order_to_database', async (req, res) => {
    try {
        if (!(
            req.body.email_address,
            req.body.item_list,
            req.body.hst
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let item_list = [...req.body.item_list];
        let total = 0;

        for (let i = 0; i < item_list.length; i++) {
            total += (item_list[i].food_price * item_list[i].quantity)
        }

        let customer_id = (await Customer.getCustomerDetailByEmailAddress(req.body.email_address))[0].customer_id;

        let order_id = (await Order.insertNewOrder(
            customer_id,
            req.body.note,
            Math.floor(total * 100),
            getTimestamp(),
            Math.floor(req.body.hst * 100))).order_id;

        for (let i = 0; i < item_list.length; i++) {
            await Order.insertNewOrderItem(
                order_id,
                item_list[i].food_item_id,
                item_list[i].quantity,
                Math.floor(item_list[i].quantity * item_list[i].food_price * 100));
        }
        await Order.insertNewOrderStatus(order_id, "PREPARING");

        return res.status(201).json({ success: true, message: 'Add to database successful' });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: e.message });
    }
})

// Export the router
module.exports = router;

