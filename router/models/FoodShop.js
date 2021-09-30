// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodShop: async (manager_id, food_shop_category_id, food_shop_name,
        food_shop_description, created_at, working_address, lat,
        lon, open_time, close_time, image_url) => {

        let sql = `INSERT INTO food_shop(manager_id, food_shop_category_id, food_shop_name, food_shop_description, created_at, working_address, lat, lon, open_time, close_time, image_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        RETURNING food_shop_id`;
        const result = await client.query(sql, [manager_id, food_shop_category_id,
            food_shop_name, food_shop_description,
            created_at, working_address, lat, lon,
            open_time, close_time, image_url]);
        if (result.rowCount === 1) {
            return { success: true, food_shop_id: result.rows[0].food_shop_id };
        } else {
            return { success: false, food_shop_id: null };
        }
    },
    getFoodShopByManagerId: async (manager_id) => {
        let sql = `SELECT *
                    FROM food_shop
                    WHERE manager_id = $1`;
        const results = await client.query(sql, [manager_id]);
        return results.rows;
    },
    updateFoodShop: async (food_shop_id, food_shop_category_id, food_shop_name, food_shop_description,
        image_url, working_address, lat, lon, open_time, close_time, active, updated_at) => {
        let sql = `UPDATE food_shop
                    SET food_shop_category_id = $2, food_shop_name = $3, food_shop_description = $4, image_url = $5, working_address = $6, lat = $7, 
                    lon = $8, open_time = $9, close_time = $10, active = $11, updated_at = $12
                    WHERE food_shop_id = $1`;
        const result = await client.query(sql, [food_shop_id, food_shop_category_id, food_shop_name, food_shop_description,
            image_url, working_address, lat, lon, open_time, close_time, active, updated_at]);
        return (result.rowCount === 1);
    },
    updateFoodShopImage: async (food_shop_id, image_url) => {
        let sql = `UPDATE food_shop
                    SET image_url = $1
                    WHERE food_shop_id = $2`;
        const result = await client.query(sql, [image_url, food_shop_id]);
        return (result.rowCount === 1);
    }
};