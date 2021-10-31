// Load all packages
const express = require('express');

// Load Models
const FoodItem = require('./models/FoodItem');

// Create express router, connect to database
const router = express.Router();

router.get('/get_food_items_by_shop_id', async (req, res) => {
    try {
        if (!req.query.food_shop_id)
            return res.status(400).json({ success: false, message: "Pleases provide shop id!" });

        let results = await FoodItem.getCustomerFoodItemByFoodShopId(req.query.food_shop_id);
        for (let i = 0; i < results.length; i++) {
            results[i].food_price = results[i].food_price / 100;
        }

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_food_items_by_category_id', async (req, res) => {
    try {
        if (!req.query.food_category_id)
            return res.status(400).json({ success: false, message: "Pleases provide category id!" });

        let results = await FoodItem.getCustomerFoodItemByCategoryId(req.query.food_category_id);
        for (let i = 0; i < results.length; i++) {
            results[i].food_price = results[i].food_price / 100;
        }

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_food_item_by_id', async (req, res) => {
    try {
        if (!req.query.food_item_id)
            return res.status(400).json({ success: false, message: "Pleases provide item id!" });

        let result = await FoodItem.getCustomerFoodItemDetailById(req.query.food_item_id);
        result.food_price = result.food_price / 100;

        return res.status(200).json({ success: true, data: result });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;