// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const FoodItem = require('./models/FoodItem');

// Create express router, connect to database
const router = express.Router();

router.post('/add_food_item', async (req, res) => {
    try {
        let result = await FoodItem.addFoodItem(req.body.food_category_id, req.body.food_name,
            req.body.food_price, req.body.food_description, null,
            getTimestamp());
        console.log(result);
        return res.end();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;