// Load all packages
const express = require('express');

// Create express router
const router = express.Router();

// / router for testing node is working
router.get('/', (req, res) => {
    res.send('Hi test api!');
});

// Export the router
module.exports = router;