// Load all packages
const express = require('express');

// Load shared functions

// Load Models
const FoodShop = require('./models/FoodShop');
const Customer = require('./models/Customer');
const CustomerFavouriteFoodShop = require('./models/CustomerFavouriteFoodShop');

// Create express router, connect to database
const router = express.Router();

router.get('/get_random_food_shops', async (req, res) => {
    try {

        if (!req.query.email_address)
            return res.status(400).json({ success: false, message: "Pleases provide email address!" });

        let results = await FoodShop.customerRandomlyPopUp();
        let favourite_list = await CustomerFavouriteFoodShop.getFavouriteListByCustomerEmailAddress(req.query.email_address);

        for (let i = 0; i < results.length; i++) {
            results[i].on_favourite = false;
            for (let j = 0; j < favourite_list.length; j++) {
                if (results[i].food_shop_id === favourite_list[j].food_shop_id) {
                    results[i].on_favourite = true;
                    break;
                }
            }
        }

        return res.status(200).json({ success: true, data: results });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/update_favourite_food_shop', async (req, res) => {
    try {
        if (!(
            req.body.email_address &&
            req.body.food_shop_id
        ))
            return res.status(400).json({ success: false, message: "Pleases complete necessary information!" });

        let customers = await Customer.getCustomerDetailByEmailAddress(req.body.email_address);
        if (customers.length !== 1)
            return res.status(401).json({ success: false, message: "Invalid customer, please try again!" });

        if (req.body.on_favourite) {
            // delete
            let delete_result = await CustomerFavouriteFoodShop.deleteFavouriteFoodShop(customers[0].customer_id, req.body.food_shop_id);
            if (delete_result) {
                return res.status(201).json({ success: true, message: 'Remove from favourite list successful!' });
            } else {
                return res.status(500).json({ success: false, message: 'Sorry, fail to remove. Please try again.' });
            }
        } else {
            // add
            let add_result = await CustomerFavouriteFoodShop.addFavouriteFoodShop(customers[0].customer_id, req.body.food_shop_id);
            if (add_result) {
                return res.status(201).json({ success: true, message: 'Add to favourite list successful!' });
            } else {
                return res.status(500).json({ success: false, message: 'Sorry, fail to add. Please try again.' });
            }
        }

    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Export the router
module.exports = router;