// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');
const uploadImage = require('./shared_function/uploadImage');

// Load Models
const FoodShopCategory = require('./models/FoodShopCategory');
const FoodCategoryExample = require('./models/FoodCategoryExample');
const FoodShop = require('./models/FoodShop');
const FoodCategory = require('./models/FoodCategory');

// Create express router, connect to database
const router = express.Router();

router.get('/get_all_food_shop_category', async (req, res) => {
    try {
        let results = await FoodShopCategory.getAllFoodShopCategory();
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_match_food_category', async (req, res) => {
    try {
        if (!req.query.content) {
            return res.status(400).json({ success: false, message: 'Please give the content for matching' });
        }
        let results = await FoodCategoryExample.getMatchFoodCategoryExample(req.query.content);
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_food_shops_by_manager', async (req, res) => {
    try {
        if (!req.query.manager_id) {
            return res.status(400).json({ success: false, message: 'Please provide the detail of manager' });
        }

        let results = await FoodShop.getFoodShopByManagerId(req.query.manager_id);
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_food_category_by_food_shop', async (req, res) => {
    try {
        if (!req.query.food_shop_id) {
            return res.status(400).json({ success: false, message: 'Please provide the detail of food shop' });
        }

        let results = await FoodCategory.getAllFoodCategoryByFoodShopId(req.query.food_shop_id);
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_food_shop', async (req, res) => {
    try {
        if (!(
            req.body.manager_id &&
            req.body.food_shop_category_id &&
            req.body.food_shop_name &&
            req.body.food_shop_description &&
            req.body.working_address &&
            req.body.lat &&
            req.body.lon &&
            req.body.open_time &&
            req.body.close_time
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the necessary information!" });

        let current_timestamp = getTimestamp();
        let image_url = null;
        if (req.body.image_url) {
            image_url = req.body.image_url
        }
        let result = await FoodShop.addFoodShop(req.body.manager_id, req.body.food_shop_category_id, req.body.food_shop_name,
            req.body.food_shop_description, current_timestamp, req.body.working_address, req.body.lat, req.body.lon,
            req.body.open_time, req.body.close_time, image_url);

        if (result) {
            return res.status(201).json({ success: true, message: 'Add Food Shop Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to add food shop. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_food_category', async (req, res) => {
    try {
        if (!(
            req.body.food_shop_id &&
            req.body.food_category_name
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the necessary information!" });

        let result = await FoodCategory.addFoodCategory(req.body.food_shop_id, req.body.food_category_name);
        if (result) {
            return res.status(201).json({ success: true, message: 'Add Food Category Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to add food category. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_food_shop', async (req, res) => {
    try {

        if (!(
            req.body.food_shop_id &&
            req.body.food_shop_category_id &&
            req.body.food_shop_name &&
            req.body.food_shop_description &&
            req.body.working_address &&
            req.body.lat &&
            req.body.lon &&
            req.body.open_time &&
            req.body.close_time
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the necessary information!" });

        let current_timestamp = getTimestamp();

        let image_url = null;
        if (req.body.image_url) {
            image_url = req.body.image_url
        }
        let active = false;
        if (req.body.active) {
            active = true;
        }

        let result = await FoodShop.updateFoodShop(req.body.food_shop_id, req.body.food_shop_category_id,
            req.body.food_shop_name, req.body.food_shop_description, image_url, req.body.working_address,
            req.body.lat, req.body.lon, req.body.open_time, req.body.close_time, active, current_timestamp);

        if (result) {
            return res.status(201).json({ success: true, message: 'Update Food Shop Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update food shop. 
            Please check any information you give.` });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_food_category', async (req, res) => {
    try {
        if (!(
            req.body.food_category_id &&
            req.body.food_category_name
        ))
            return res.status(400).json({ success: false, message: "Pleases complete the necessary information!" });

        let result = await FoodCategory.updateFoodCategoryById(req.body.food_category_id, req.body.food_category_name);
        if (result) {
            return res.status(201).json({ success: true, message: 'Update Food Category Successful!' });
        } else {
            return res.status(500).json({
                success: false, message: `Sorry, fail to update food category. 
            Please check any information you give.` });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/upload_food_shop_image', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'Please provide id' });
        }

        await uploadImage(req, res, 4, req.query.id, FoodShop.updateFoodShopImage);
        return;
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;