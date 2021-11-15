// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    completeOrder: async (order_id) => {
        let sql = `UPDATE order_status
                    SET order_status_name = 'COMPLETE'
                    WHERE order_id = $1`;
        let result = await client.query(sql, [order_id]);
        return (result.rowCount === 1);
    }
};