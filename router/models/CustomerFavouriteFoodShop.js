// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getFavouriteListByCustomerEmailAddress: async (email_address) => {
        let sql = `SELECT f.favourite_id, f.customer_id, f.food_shop_id
                    FROM customer_favourite_food_shop f
                    JOIN customer c
                    ON f.customer_id = c.customer_id
                    WHERE c.email_address = $1`;
        const results = await client.query(sql, [email_address]);
        return results.rows;
    },
    addFavouriteFoodShop: async (customer_id, food_shop_id) => {
        let sql = `INSERT INTO customer_favourite_food_shop (customer_id, food_shop_id)
                    VALUES ($1, $2)`;
        const result = await client.query(sql, [customer_id, food_shop_id]);
        return (result.rowCount === 1);
    },
    deleteFavouriteFoodShop: async (customer_id, food_shop_id) => {
        let sql = `DELETE FROM customer_favourite_food_shop
                    WHERE customer_id = $1 AND food_shop_id = $2`;
        await client.query(sql, [customer_id, food_shop_id]);
        return true;
    }
};