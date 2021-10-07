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
    },
    getAllFoodItemByCategoryId: async (food_category_id) => {
        let sql = `SELECT *
                    FROM food_item
                    WHERE food_category_id = $1`;
        const results = await client.query(sql, [food_category_id]);
        return results.rows;
    },
    getFoodItemByFoodItemId: async (food_item_id) => {
        let sql = `SELECT *
                    FROM food_item
                    JOIN food_category
                    ON food_item.food_category_id = food_category.food_category_id
                    WHERE food_item_id = $1`;
        const results = await client.query(sql, [food_item_id]);
        return results.rows[0];
    },
    updateFoodItem: async (food_item_id, food_category_id, food_name, food_price, food_description, image_url, updated_at) => {
        let sql = `UPDATE food_item
                    SET food_category_id = $2, food_name = $3, food_price = $4, food_description = $5, image_url = $6, updated_at = $7
                    WHERE food_item_id = $1`;
        const result = await client.query(sql, [food_item_id, food_category_id, food_name, food_price, food_description, image_url, updated_at]);
        return (result.rowCount === 1);
    },
    updateFoodItemImage: async (food_item_id, image_url) => {
        let sql = `UPDATE food_item
                    SET image_url = $2
                    WHERE food_item_id = $1`;
        const result = await client.query(sql, [food_item_id, image_url]);
        return (result.rowCount === 1);
    }
};