// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const FoodItem = require('./models/FoodItem');
const FoodOption = require('./models/FoodOption');
const FoodOptionDetail = require('./models/FoodOptionDetail');

// Create express router, connect to database
const router = express.Router();

router.post('/add_food_item', async (req, res) => {
    try {
        if (!(req.body.food_category_id &&
            req.body.food_name &&
            req.body.food_price &&
            req.body.food_description))
            return res.status(400).json({ success: false, message: 'Please complete details' });

        let image_url = null;
        if (req.body.image_url) {
            image_url = req.body.image_url;
        }
        let food_price = req.body.food_price * 100;
        let current_time = getTimestamp();

        let result = await FoodItem.addFoodItem(req.body.food_category_id, req.body.food_name,
            food_price, req.body.food_description, image_url,
            current_time);

        if (result.success) {
            return res.status(201).json({ success: true, message: 'Add food item successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, please try again' });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_food_option', async (req, res) => {
    try {
        if (!(req.body.food_item_id &&
            req.body.food_option_name))
            return res.status(400).json({ success: false, message: 'Please complete details' });

        let result = await FoodOption.addFoodOption(req.body.food_item_id, req.body.food_option_name);
        if (result.success) {
            return res.status(201).json({ success: true, message: 'Add food option successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, please try again' });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_food_option_detail', async (req, res) => {
    try {
        if (!(req.body.food_option_id &&
            req.body.food_option_detail_name &&
            req.body.add_price))
            return res.status(400).json({ success: false, message: 'Please complete details' });

        let add_price = req.body.add_price * 100;
        let result = await FoodOptionDetail.addFoodOptionDetail(req.body.food_option_id,
            req.body.food_option_detail_name, add_price);
        if (result.success) {
            return res.status(201).json({ success: true, message: 'Add food option detail successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, please try again' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;