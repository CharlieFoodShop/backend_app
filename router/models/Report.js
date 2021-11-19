// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getRecentSalesList: async (email_address) => {
        let sql = `SELECT o.order_id, o.total, o.hst, o.completed_at
                    FROM "order" o
                    JOIN order_item oi
                    ON o.order_id = oi.order_id
                    JOIN food_item fi
                    ON oi.food_item_id = fi.food_item_id
                    JOIN food_category fc
                    ON fi.food_category_id = fc.food_category_id
                    JOIN food_shop fs
                    ON fs.food_shop_id = fc.food_shop_id
                    JOIN manager m
                    ON m.manager_id = fs.manager_id
                    WHERE m.email_address = $1
                    AND o.completed_at >= current_timestamp(0)::TIMESTAMP WITHOUT TIME ZONE - INTERVAL '7 days'
                    GROUP BY o.order_id`;
        let results = await client.query(sql, [email_address]);
        return results.rows;
    },
    getMostProlificSellera: async () => {
        let sql = `SELECT fs.food_shop_id, fs.food_shop_name,  sum(oi.sub_total) as food_total, m.first_name || ' ' || m.last_name as name
                    FROM "order" o
                    JOIN order_item oi
                    ON o.order_id = oi.order_id
                    JOIN food_item fi
                    ON oi.food_item_id = fi.food_item_id
                    JOIN food_category fc
                    ON fi.food_category_id = fc.food_category_id
                    JOIN food_shop fs
                    ON fs.food_shop_id = fc.food_shop_id
                    JOIN manager m
                    ON m.manager_id = fs.manager_id
                    GROUP BY fs.food_shop_id, m.manager_id
                    ORDER BY sum(oi.sub_total) DESC`;
        let results = await client.query(sql);
        return results.rows;
    },

    getRegionList: async () => {
        let sql = `SELECT address
                    FROM customer
                    WHERE address IS NOT null`;

        let results = await client.query(sql);
        return results.rows;
    },
    getUserList: async () => {
        let sql = `SELECT customer_id, first_name, last_name
                    FROM customer`;

        let results = await client.query(sql);
        return results.rows;
    },

    getSalesByTimePeriod: async (email_address, start_time, end_time) => {
        let sql = `SELECT o.order_id, o.total, o.hst, o.completed_at::time
                    FROM "order" o
                    JOIN order_item oi
                    ON o.order_id = oi.order_id
                    JOIN food_item fi
                    ON oi.food_item_id = fi.food_item_id
                    JOIN food_category fc
                    ON fi.food_category_id = fc.food_category_id
                    JOIN food_shop fs
                    ON fs.food_shop_id = fc.food_shop_id
                    JOIN manager m
                    ON m.manager_id = fs.manager_id
                    WHERE m.email_address = $1
                    AND (o.completed_at::time BETWEEN $2 AND $3)
                    GROUP BY o.order_id`;

        let results = await client.query(sql, [email_address, start_time, end_time]);
        return results.rows;
    },
    getSalesByRegion: async (email_address, region) => {
        let sql = `SELECT o.order_id, o.total, o.hst, c.address
                    FROM "order" o
                    JOIN order_item oi
                    ON o.order_id = oi.order_id
                    JOIN customer c
                    ON o.customer_id = c.customer_id
                    JOIN food_item fi
                    ON oi.food_item_id = fi.food_item_id
                    JOIN food_category fc
                    ON fi.food_category_id = fc.food_category_id
                    JOIN food_shop fs
                    ON fs.food_shop_id = fc.food_shop_id
                    JOIN manager m
                    ON m.manager_id = fs.manager_id
                    WHERE m.email_address = $1
                    AND c.address = $2
                    GROUP BY o.order_id, c.customer_id`;

        let results = await client.query(sql, [email_address, region]);
        return results.rows;
    },
    getSalesByUserId: async (email_address, user_id) => {
        let sql = `SELECT o.order_id, o.total, o.hst, c.first_name || ' ' || c.last_name as name
                    FROM "order" o
                    JOIN order_item oi
                    ON o.order_id = oi.order_id
                    JOIN customer c
                    ON o.customer_id = c.customer_id
                    JOIN food_item fi
                    ON oi.food_item_id = fi.food_item_id
                    JOIN food_category fc
                    ON fi.food_category_id = fc.food_category_id
                    JOIN food_shop fs
                    ON fs.food_shop_id = fc.food_shop_id
                    JOIN manager m
                    ON m.manager_id = fs.manager_id
                    WHERE m.email_address = $1
                    AND c.customer_id = $2
                    GROUP BY o.order_id, c.customer_id`;

        let results = await client.query(sql, [email_address, user_id]);
        return results.rows;
    }
};