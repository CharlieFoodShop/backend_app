// Load all packages
const express = require('express');
const { Client } = require('pg');
const config = require('../config');

// Create express router, connect to database
const router = express.Router();
const client = new Client(config.connection);
client.connect();

// / router for testing node is working
router.get('/', (req, res) => {
    res.send('Hi test api!');
});

router.get('/test_database', async (req, res) => {
    try {
        let sql = `SELECT *
                    FROM food_option_example`;
        const results = await client.query(sql);

        res.json({ data: results.rows });
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