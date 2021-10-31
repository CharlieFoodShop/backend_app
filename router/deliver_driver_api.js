// Load all packages
const express = require('express');

// Load shared functions
const uploadImage = require('./shared_function/uploadImage');

// Load Models
const DeliverDriver = require('./models/DeliverDriver');

// Create express router, connect to database
const router = express.Router();

router.get('/get_all_driver_detail', async (req, res) => {
    try {
        let results = await DeliverDriver.getAllDeliverDrivers();
        for (let i = 0; i < results.length; i++) {
            results[i].cost = results[i].cost / 100;
        }

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/driver_upload_avatar', async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({ success: false, message: 'Please provide id' });
        }

        await uploadImage(req, res, 2, req.query.id, DeliverDriver.UpdateDriverAvatar);
        return;
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});


// Export the router
module.exports = router;