// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getAllFoodShopCategory: async () => {
        let sql = `SELECT *
                    FROM food_shop_category`;
        const results = await client.query(sql);
        return results.rows;
    }
};