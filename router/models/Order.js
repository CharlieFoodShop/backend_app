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
    },
    getCurrentOrders: async (email_address) => {
        let sql = `SELECT "order".order_id, "order".created_at, order_status_name
                    FROM "order"
                    JOIN customer
                    ON "order".customer_id = customer.customer_id
                    JOIN order_status
                    ON "order".order_id = order_status.order_id
                    WHERE order_status.order_status_name = 'PREPARING' AND email_address = $1
                    ORDER BY "order".created_at DESC`;
        const results = await client.query(sql, [email_address]);
        return results.rows;
    },
    getOrderHistory: async (email_address) => {
        let sql = `SELECT "order".order_id, "order".created_at, order_status_name
                    FROM "order"
                    JOIN customer
                    ON "order".customer_id = customer.customer_id
                    JOIN order_status
                    ON "order".order_id = order_status.order_id
                    WHERE email_address = $1
                    ORDER BY "order".created_at DESC`;
        const results = await client.query(sql, [email_address]);
        return results.rows;
    },
    getCustomerOrderDetailByOrderId: async (order_id) => {
        let sql = `SELECT "order".order_id, note, total, created_at, completed_at, hst, order_status_name
                    FROM "order"
                    JOIN order_status
                    ON "order".order_id = order_status.order_id
                    WHERE "order".order_id = $1`;
        const results = await client.query(sql, [order_id]);
        return results.rows[0];
    },
    insertNewOrder: async (customer_id, note, total, created_at, hst) => {
        let sql = `INSERT INTO "order" (customer_id, note, total, created_at, hst)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING order_id`;
        const result = await client.query(sql, [customer_id, note, total, created_at, hst]);
        if (result.rowCount === 1) {
            return { success: true, order_id: result.rows[0].order_id };
        } else {
            return { success: false, order_id: null };
        }
    },
    insertNewOrderItem: async (order_id, food_item_id, quantity, sub_total) => {
        let sql = `INSERT INTO order_item(order_id, food_item_id, options, quantity, sub_total)
                    VALUES ($1, $2, null, $3, $4)`;
        const result = await client.query(sql, [order_id, food_item_id, quantity, sub_total]);
        return result.rowCount === 1;
    },
    insertNewOrderStatus: async (order_id, order_status_name) => {
        let sql = `INSERT INTO order_status(order_id, order_status_name)
                    VALUES ($1, $2)`;
        const result = await client.query(sql, [order_id, order_status_name]);
        return result.rowCount === 1;
    }
};