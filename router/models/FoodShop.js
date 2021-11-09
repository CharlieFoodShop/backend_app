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
    getFoodShopByFoodShopId: async (food_shop_id) => {
        let sql = `SELECT *
                    FROM food_shop
                    JOIN food_shop_category
                    ON food_shop.food_shop_category_id = food_shop_category.food_shop_category_id
                    WHERE food_shop_id = $1`;
        const results = await client.query(sql, [food_shop_id]);
        return results.rows[0];
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
    updateFoodShopActivity: async (food_shop_id, active) => {
        let sql = `UPDATE food_shop
                    SET active = $1
                    WHERE food_shop_id = $2`;
        const result = await client.query(sql, [active, food_shop_id]);
        return (result.rowCount === 1);
    },
    updateFoodShopImage: async (food_shop_id, image_url) => {
        let sql = `UPDATE food_shop
                    SET image_url = $1
                    WHERE food_shop_id = $2`;
        const result = await client.query(sql, [image_url, food_shop_id]);
        return (result.rowCount === 1);
    },





    customerRandomlyPopUp: async () => {
        let sql = `SELECT food_shop_id, food_shop_name, image_url, working_address, food_shop_category_name
                    FROM food_shop
                    JOIN food_shop_category
                    ON food_shop.food_shop_category_id = food_shop_category.food_shop_category_id
                    WHERE active = true
                    ORDER BY RANDOM()
                    LIMIT 50`;
        const results = await client.query(sql);
        return results.rows;
    },
    getCustomerFavouriteFoodShops: async (email_address) => {
        let sql = `SELECT food_shop.food_shop_id, food_shop_name, image_url, working_address, food_shop_category_name, active
                    FROM food_shop
                    JOIN food_shop_category
                    ON food_shop.food_shop_category_id = food_shop_category.food_shop_category_id
                    JOIN customer_favourite_food_shop
                    ON customer_favourite_food_shop.food_shop_id = food_shop.food_shop_id
                    JOIN customer
                    ON customer_favourite_food_shop.customer_id = customer.customer_id
                    WHERE customer.email_address = $1`;
        const results = await client.query(sql, [email_address]);
        return results.rows;
    },
    getCustomerFoodShopDetail: async (food_shop_id) => {
        let sql = `SELECT food_shop_id, food_shop_category_name, food_shop_name, 
                    food_shop_description, food_shop_rating, image_url, working_address, open_time, active
                    FROM food_shop
                    JOIN food_shop_category
                    ON food_shop_category.food_shop_category_id = food_shop.food_shop_category_id
                    WHERE food_shop_id = $1`;
        const results = await client.query(sql, [food_shop_id]);
        return results.rows[0];
    },
    getSearchedFoodShops: async (text) => {
        let sql = `SELECT food_shop.food_shop_id, food_shop_name, image_url, working_address, food_shop_category_name, active
                    FROM food_shop
                    JOIN food_shop_category
                    ON food_shop_category.food_shop_category_id = food_shop.food_shop_category_id
                    WHERE UPPER(food_shop_name) LIKE concat('%', UPPER($1), '%') OR UPPER(food_shop_category_name) LIKE concat('%', UPPER($2), '%')`;
        const results = await client.query(sql, [text, text]);
        return results.rows;
    }
};