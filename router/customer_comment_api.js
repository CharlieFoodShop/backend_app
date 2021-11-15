// Load all packages
const express = require('express');

// Load shared functions
const getTimestamp = require('./shared_function/getTimestamp');

// Load Models
const FoodItem = require('./models/FoodItem');
const FoodComment = require('./models/FoodComment');
const Customer = require('./models/Customer');

// Create express router, connect to database
const router = express.Router();

router.get('/get_comment_list_by_item_id', async (req, res) => {
    try {
        if (!(
            req.query.email_address &&
            req.query.food_item_id
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let food_detail = await FoodItem.getFoodItemByFoodItemId(req.query.food_item_id);
        let data = {
            food_name: food_detail.food_name,
            image_url: food_detail.image_url,
            comment_list: []
        };

        let results = await FoodComment.getCustomerFoodCommentRating(req.query.email_address, req.query.food_item_id);
        data.comment_list = results;

        return res.status(200).json({ success: true, data: data });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/get_comment_detail_by_id', async (req, res) => {
    try {
        if (!req.query.food_comment_id)
            return res.status(400).json({ success: false, message: "Pleases provide comment id!" });

        let result = await FoodComment.getCustomerFoodCommentRatingDetailById(req.query.food_comment_id);
        if (result.success) {
            return res.status(200).json({ success: true, data: result.food_comment_detail });
        } else {
            return res.status(404).json({ success: false, message: 'Sorry, can not found comment detail!' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/add_new_comment', async (req, res) => {
    try {
        if (!(
            req.body.food_item_id &&
            req.body.email_address &&
            req.body.rating
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let customer = await Customer.getCustomerDetailByEmailAddress(req.body.email_address);
        if (customer.length === 0) {
            return res.status(401).json({ success: false, message: 'Customer can not be found!' });
        }

        let comment = '';
        if (req.body.comment) {
            comment = req.body.comment;
        }

        let result = await FoodComment.addNewFoodComment(
            req.body.food_item_id,
            customer[0].customer_id,
            comment,
            req.body.rating,
            getTimestamp());

        if (result) {
            return res.status(201).json({ success: true, message: 'Add comment successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to add comment. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/edit_comment', async (req, res) => {
    try {
        if (!(
            req.body.rating &&
            req.body.food_comment_id
        ))
            return res.status(400).json({ success: false, message: "Pleases provide all the information!" });

        let comment = "";
        if (req.body.comment) {
            comment = req.body.comment;
        }

        let result = await FoodComment.editFoodComment(comment, req.body.rating, req.body.food_comment_id);
        if (result) {
            return res.status(201).json({ success: true, message: 'Edit comment successful!' });
        } else {
            return res.status(500).json({ success: false, message: 'Sorry, fail to edit comment. Please try again.' });
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/delete_comment', async (req, res) => {
    try {
        if (!req.body.food_comment_id)
            return res.status(400).json({ success: false, message: "Pleases provide comment detail!" });

        await FoodComment.deleteFoodComment(req.body.food_comment_id);
        return res.status(201).json({ success: true, message: 'Delete comment successful!' });

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;
