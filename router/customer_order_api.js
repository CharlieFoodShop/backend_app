// Load all packages
const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const { decrypt } = require('./shared_function/encrypt-decrypt');

// Load Models
const Order = require('./models/Order');
const DeliverDriver = require('./models/DeliverDriver');
const Customer = require('./models/Customer');

// Create express router, connect to database
const router = express.Router();

router.post('/create_order', async (req, res) => {
    try {
        if (!(
            req.body.email_address,
            req.body.item_list,
            req.body.address,
            req.body.driver_id,
            req.body.lat,
            req.body.lon
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let item_list = [...req.body.item_list];
        let driver_detail = await DeliverDriver.getDeliverDriverById(req.body.driver_id);
        let total = driver_detail.cost / 100;

        for (let i = 0; i < item_list.length; i++) {
            total += (item_list[i].food_price * item_list[i].quantity)
        }


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
            req.body.address,
            req.body.driver_id,
            req.body.lat,
            req.body.lon
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let item_list = [...req.body.item_list];
        let driver_detail = await DeliverDriver.getDeliverDriverById(req.body.driver_id);
        let total = driver_detail.cost / 100;

        for (let i = 0; i < item_list.length; i++) {
            total += (item_list[i].food_price * item_list[i].quantity)
        }

        let customer_id = (await Customer.getCustomerDetailByEmailAddress(req.body.email_address))[0].customer_id;

        let order_id = (await Order.insertNewOrder(
            req.body.driver_id,
            customer_id,
            req.body.note,
            Math.floor(total * 100),
            getTimestamp(),
            req.body.address,
            req.body.lat,
            req.body.lon)).order_id;
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
        return res.status(500).json({ success: false, message: e.message });
    }
})

// Export the router
module.exports = router;

