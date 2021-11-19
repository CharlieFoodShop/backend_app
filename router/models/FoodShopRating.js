// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addRatingForFoodShop: async (food_shop_id, rating) => {
        let sql = `INSERT INTO food_shop_rating(food_shop_id, rating)
                    VALUES ($1, $2)
                    RETURNING food_shop_rating_id`;
        let results = await client.query(sql, [food_shop_id, rating]);
        return results.rowCount === 1;
    }
};