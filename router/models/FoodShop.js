// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodShop: async (manager_id, food_shop_category_id, food_shop_name,
        food_shop_description, created_at, working_address, lat,
        lon, open_time, close_time) => {

        let sql = `INSERT INTO food_shop(manager_id, food_shop_category_id, food_shop_name, food_shop_description, created_at, working_address, lat, lon, open_time, close_time)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        const result = await client.query(sql, [manager_id, food_shop_category_id,
            food_shop_name, food_shop_description,
            created_at, working_address, lat, lon,
            open_time, close_time]);
        return (result.rowCount === 1);
    },

    getFoodShopByManagerId: async (manager_id) => {
        let sql = `SELECT *
                    FROM food_shop
                    WHERE manager_id = $1`;
        const results = await client.query(sql, [manager_id]);
        return results.rows;
    }
};