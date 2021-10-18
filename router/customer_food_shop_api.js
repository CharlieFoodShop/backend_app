// Load all packages
const express = require('express');

// Load shared functions

// Load Models
const FoodShop = require('./models/FoodShop');

// Create express router, connect to database
const router = express.Router();

router.get('/get_random_food_shops', async (req, res) => {
    try {
        let results = await FoodShop.customerRandomlyPopUp();
        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;