// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getCustomerOrderItemList: async (order_id) => {
        let sql = `SELECT order_item_id, food_item.food_item_id, quantity, sub_total, food_name, food_price
                    FROM order_item
                    JOIN food_item
                    ON order_item.food_item_id = food_item.food_item_id
                    WHERE order_id = $1`;
        const results = await client.query(sql, [order_id]);
        return results.rows;
    }
};