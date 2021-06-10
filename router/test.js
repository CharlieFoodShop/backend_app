// Load all packages
const express = require('express');

// Create express router
const router = express.Router();

// / router for testing node is working
router.get('/', (req, res) => {
    res.send('Hi test api!');
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