// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodItem: async (food_category_id, food_name,
        food_price, food_description, image_url,
        created_at) => {

        let sql = `INSERT INTO food_item(food_category_id, food_name, food_price, food_description, image_url, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING food_item_id`;
        const result = await client.query(sql, [food_category_id, food_name, food_price, food_description, image_url, created_at]);
        if (result.rowCount === 1) {
            return { success: true, food_item_id: result.rows[0].food_item_id }
        } else {
            return { success: false, food_item_id: null }
        }
    }
};