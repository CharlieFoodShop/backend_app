// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const OrderStatus = require('./models/OrderStatus');

// Create express router, connect to database
const router = express.Router();

router.get('/get_current_orders', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: "Pleases provide manager detail!" });


        let results = await Order.getManagerCurrentOrdersByEmail(req.query.email_address);
        for (let i = 0; i < results.length; i++) {
            results[i].total = results[i].total / 100;
            results[i].hst = results[i].hst / 100;

            let items = await OrderItem.getCustomerOrderItemList(results[i].order_id);
            for (let j = 0; j < items.length; j++) {
                items[j].sub_total = items[j].sub_total / 100;
                items[j].food_price = items[j].food_price / 100;
            }

            results[i].items = items;
        }

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_order_history', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: "Pleases provide manager detail!" });

        let results = await Order.getManagerOrderHistory(req.query.email_address);
        return res.status(200).json({ success: true, data: results });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_order_detail', async (req, res) => {
    try {

        if (!req.query.order_id)
            return res.status(400).json({ success: false, message: "Pleases provide order detail!" });

        let results = await Order.getManagerOrderDetail(req.query.order_id);
        if (results.length === 0)
            return res.status(404).json({ success: false, message: 'Sorry, order can not be found!' });

        let result = results[0];
        result.total = result.total / 100;
        result.hst = result.hst / 100;

        let items = await OrderItem.getCustomerOrderItemList(result.order_id);
        for (let j = 0; j < items.length; j++) {
            items[j].sub_total = items[j].sub_total / 100;
            items[j].food_price = items[j].food_price / 100;
        }
        result.items = items;

        return res.status(200).json({ success: true, data: result });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/complete_order', async (req, res) => {
    try {
        if (!req.body.order_id)
            return res.status(400).json({ success: false, message: "Pleases provide order id!" });

        await Order.updateCompletedTime(getTimestamp(), req.body.order_id);
        await OrderStatus.completeOrder(req.body.order_id);

        return res.status(201).json({ success: true, message: 'Complete Order Successful!' });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;