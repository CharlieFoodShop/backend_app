// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const uploadImage = require('./shared_function/uploadImage');

// Load Models
const FoodItem = require('./models/FoodItem');
const FoodOption = require('./models/FoodOption');
const FoodOptionDetail = require('./models/FoodOptionDetail');

// Create express router, connect to database
const router = express.Router();

router.get('/get_all_food_item_by_category', async (req, res) => {
    try {
        if (!req.query.food_category_id)
            return res.status(400).json({ success: false, message: 'Please provide category detail.' });

        let results = await FoodItem.getAllFoodItemByCategoryId(req.query.food_category_id);
        let _results = [];
        results.forEach(item => {
            item.food_price = item.food_price / 100;
            _results.push(item);
        });

        return res.status(200).json({ success: true, data: _results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_all_food_option_by_item', async (req, res) => {
    try {
        if (!req.query.food_item_id)
            return res.status(400).json({ success: false, message: 'Please provide item detail.' });

        let results = await FoodOption.getAllFoodOptionByItemId(req.query.food_item_id);
        return res.status(200).json({ success: true, data: results })
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_all_food_option_detail_by_option', async (req, res) => {
    try {
        if (!req.query.food_option_id)
            return res.status(400).json({ success: false, message: 'Please provide option detail.' });

        let results = await FoodOptionDetail.getAllFoodOptionDetailByOptionId(req.query.food_option_id);
        let _results = [];
        results.forEach(item => {
            item.add_price = item.add_price / 100;
            _results.push(item);
        });

        return res.status(200).json({ success: true, data: _results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

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
        let food_price = Math.round(req.body.food_price * 100);
        let current_time = getTimestamp();

        let result = await FoodItem.addFoodItem(req.body.food_category_id, req.body.food_name,
            food_price, req.body.food_description, image_url,
            current_time);

        if (result.success) {
            return res.status(201).json({ success: true, message: 'Add food item successful!', food_item_id: result.food_item_id });
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
            return res.status(201).json({ success: true, message: 'Add food option successful!', food_option_id: result.food_option_id });
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

        let add_price = Math.round(req.body.add_price * 100);
        let result = await FoodOptionDetail.addFoodOptionDetail(req.body.food_option_id,
            req.body.food_option_detail_name, add_price);

        if (result.success) {
            return res.status(201).json({
                success: true, message: 'Add food option detail successful!',
                food_option_detail_id: result.food_option_detail_id
            });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, please try again' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_food_item', async (req, res) => {
    try {
        if (!(req.body.food_item_id &&
            req.body.food_category_id &&
            req.body.food_name &&
            req.body.food_price &&
            req.body.food_description))
            return res.status(400).json({ success: false, message: 'Please complete details' });

        let image_url = null;
        if (req.body.image_url) {
            image_url = req.body.image_url;
        }
        let food_price = Math.round(req.body.food_price * 100);
        let current_time = getTimestamp();

        let result = await FoodItem.updateFoodItem(req.body.food_item_id, req.body.food_category_id,
            req.body.food_name, food_price, req.body.food_description, image_url, current_time);
        if (result) {
            return res.status(201).json({ success: true, message: 'Update Food Item Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update food item. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_food_option', async (req, res) => {
    try {
        if (!(req.body.food_option_id &&
            req.body.food_option_name))
            return res.status(400).json({ success: false, message: 'Please complete details' });

        let result = await FoodOption.updateFoodOption(req.body.food_option_id, req.body.food_option_name);
        if (result) {
            return res.status(201).json({ success: true, message: 'Update Food Option Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update food option. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_food_option_detail', async (req, res) => {
    try {
        if (!(req.body.food_option_detail_id &&
            req.body.food_option_detail_name &&
            req.body.add_price))
            return res.status(400).json({ success: false, message: 'Please complete details' });
        let add_price = Math.round(req.body.add_price * 100);

        let result = await FoodOptionDetail.updateFoodOptionDetail(req.body.food_option_detail_id,
            req.body.food_option_detail_name, add_price);
        if (result) {
            return res.status(201).json({ success: true, message: 'Update Food Option Detail Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update food option detail. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/delete_food_option', async (req, res) => {
    try {
        if (!req.body.food_option_id)
            return res.status(400).json({ success: false, message: 'Please provide detail.' });

        let result = await FoodOption.deleteFoodOption(req.body.food_option_id);
        if (result) {
            return res.status(201).json({ success: true, message: 'Delete food option successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to delete food option,
            please try again!`});
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/delete_food_option_detail', async (req, res) => {
    try {
        if (!req.body.food_option_detail_id)
            return res.status(400).json({ success: false, message: 'Please provide detail.' });

        let result = await FoodOptionDetail.deleteFoodOptionDetail(req.body.food_option_detail_id);
        if (result) {
            return res.status(201).json({ success: true, message: 'Delete option detail successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to delete option detail,
            please try again!`});
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/upload_food_item_image', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'Please provide id' });
        }

        await uploadImage(req, res, 3, req.query.id, FoodItem.updateFoodItemImage);
        return;
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;