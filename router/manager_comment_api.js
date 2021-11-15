// Load all packages
const express = require('express');

// Load Models
const FoodComment = require('./models/FoodComment');

// Create express router, connect to database
const router = express.Router();

router.get('/get_comment_list_by_item_id', async (req, res) => {
    try {
        if (!req.query.food_item_id)
            return res.status(400).json({ success: false, message: "Pleases provide food detail!" });
        let results = await FoodComment.getManagerCommentListByItemId(req.query.food_item_id);

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;