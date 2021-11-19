// Load all packages
const express = require('express');

// Load Models
const Report = require('./models/Report');

// Create express router, connect to database
const router = express.Router();

router.get('/get_initial_state', async (req, res) => {
    try {
        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: 'Please give the manager detail!' });

        let recent_sales_list = await Report.getRecentSalesList(req.query.email_address);
        let recent_food_total = 0;
        let recent_hst_total = 0;
        let recent_total = 0;

        for (let i = 0; i < recent_sales_list.length; i++) {
            recent_food_total += recent_sales_list[i].total;
            recent_hst_total += recent_sales_list[i].hst;

            recent_sales_list[i].total = recent_sales_list[i].total / 100;
            recent_sales_list[i].hst = recent_sales_list[i].hst / 100;
        }

        recent_total = recent_food_total + recent_hst_total;
        recent_total = recent_total / 100;
        recent_food_total = recent_food_total / 100;
        recent_hst_total = recent_hst_total / 100;

        let most_prolific_seller = (await Report.getMostProlificSellera())[0];
        let region_list = await Report.getRegionList();
        let user_list = await Report.getUserList();

        let data = {
            recent_sales_list: recent_sales_list,
            recent_food_total: recent_food_total,
            recent_hst_total: recent_hst_total,
            recent_total: recent_total,

            most_prolific_seller: most_prolific_seller,
            region_list: region_list,
            user_list: user_list
        };

        return res.status(200).json({ success: true, data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_sales_by_time_period', async (req, res) => {
    try {
        if (!(
            req.query.email_address &&
            req.query.start_time &&
            req.query.end_time
        ))
            return res.status(400).json({ success: false, message: 'Please complete information' });

        let results = await Report.getSalesByTimePeriod(req.query.email_address, req.query.start_time, req.query.end_time);
        let food_total = 0;
        let hst_total = 0;
        let total = 0;

        for (let i = 0; i < results.length; i++) {
            food_total += results[i].total;
            hst_total += results[i].hst;
        }

        total = food_total + hst_total;
        total = total / 100;
        food_total = food_total / 100;
        hst_total = hst_total / 100;

        let data = {
            food_total: food_total,
            hst_total: hst_total,
            total: total
        };

        return res.status(200).json({ success: true, data: data });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_sales_by_region', async (req, res) => {
    try {
        if (!(
            req.query.email_address &&
            req.query.region
        ))
            return res.status(400).json({ success: false, message: 'Please complete information' });

        let results = await Report.getSalesByRegion(req.query.email_address, req.query.region);

        let food_total = 0;
        let hst_total = 0;
        let total = 0;

        for (let i = 0; i < results.length; i++) {
            food_total += results[i].total;
            hst_total += results[i].hst;
        }

        total = food_total + hst_total;
        total = total / 100;
        food_total = food_total / 100;
        hst_total = hst_total / 100;

        let data = {
            food_total: food_total,
            hst_total: hst_total,
            total: total
        };

        return res.status(200).json({ success: true, data: data });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
})

router.get('/get_sales_by_user_id', async (req, res) => {
    try {
        if (!(
            req.query.email_address &&
            req.query.user_id
        ))
            return res.status(400).json({ success: false, message: 'Please complete information' });

        let results = await Report.getSalesByUserId(req.query.email_address, req.query.user_id);
        let food_total = 0;
        let hst_total = 0;
        let total = 0;

        for (let i = 0; i < results.length; i++) {
            food_total += results[i].total;
            hst_total += results[i].hst;
        }

        total = food_total + hst_total;
        total = total / 100;
        food_total = food_total / 100;
        hst_total = hst_total / 100;

        let data = {
            food_total: food_total,
            hst_total: hst_total,
            total: total
        };

        return res.status(200).json({ success: true, data: data });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
})

// Export the router
module.exports = router;