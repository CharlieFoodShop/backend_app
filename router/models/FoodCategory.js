// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodCategory: async (food_shop_id, food_category_name) => {
        let sql = `INSERT INTO food_category(food_shop_id, food_category_name)
                    VALUES ($1, $2)`;
        const result = await client.query(sql, [food_shop_id, food_category_name]);
        return (result.rowCount === 1);
    },
    getAllFoodCategoryByFoodShopId: async (food_shop_id) => {
        let sql = `SELECT *
                    FROM food_category
                    WHERE food_shop_id = $1`;
        const results = await client.query(sql, [food_shop_id]);
        return results.rows;
    },
    updateFoodCategoryById: async (food_category_id, food_category_name) => {
        let sql = `UPDATE food_category
                    SET food_category_name = $1
                    WHERE food_category_id = $2`;
        const result = await client.query(sql, [food_category_name, food_category_id]);
        return (result.rowCount === 1);
    }
};