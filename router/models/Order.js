// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getOrderListByManager: async (manager_id) => {
        let sql = `SELECT (cu.first_name || cu.last_name) AS customer_name, o.created_at, o.order_id
            FROM "order" o
            JOIN customer cu
            ON o.customer_id = cu.customer_id
            JOIN order_item oi
            ON o.order_id = oi.order_id
            JOIN food_item fi
            ON oi.food_item_id = fi.food_item_id
            JOIN food_category fc
            ON fi.food_category_id = fc.food_category_id
            JOIN food_shop fo
            ON fo.food_shop_id = fc.food_category_id
            JOIN manager ma
            ON ma.manager_id = fo.manager_id
            WHERE ma.manager_id = $1
            ORDER BY o.created_at DESC`;
        const results = await client.query(sql, [manager_id]);
        return results.rows;
    },




    getClientKeys: async (food_item_id) => {
        let sql = `SELECT client_id, client_secret_hash
                    FROM food_item
                    JOIN food_category
                    ON food_item.food_category_id = food_category.food_category_id
                    JOIN food_shop
                    ON food_shop.food_shop_id = food_category.food_shop_id
                    JOIN manager
                    ON food_shop.manager_id = manager.manager_id
                    WHERE food_item_id = $1`;
        const result = await client.query(sql, [food_item_id]);
        return result.rows[0];
    }
};