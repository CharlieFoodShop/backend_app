// Load all packages
const express = require('express');

// Load Models
const FoodCategoryExample = require('./models/FoodCategoryExample');
const FoodOptionExample = require('./models/FoodOptionExample');

// Create express router
const router = express.Router();

// / router for testing node is working
router.get('/', (req, res) => {
    res.send('Hi test api!');
});

router.get('/test_database', async (req, res) => {
    try {
        /*
        let sql = `SELECT *
                    FROM food_option_example`;
        const results = await client.query(sql);

        res.json({ data: results.rows });
        */
        const results = await FoodOptionExample.getAllFoodOptionExample();
        res.json({ data: results });

    } catch (e) {
        res.json({ message: e.message });
    }
});

router.post('/test_post', (req, res) => {
    try {
        return res.status(201).json({ success: true, data: req.body });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});


// Export the router
module.exports = router;