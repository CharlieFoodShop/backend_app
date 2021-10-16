// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    checkToken: async (token, customer_id) => {
        let sql = `SELECT *
                    FROM customer_reset_password_token
                    WHERE token = $1 OR customer_id = $2`;
        const results = await client.query(sql, [token, customer_id]);
        if (results.rows.length > 0) {
            return { success: true, token_info: results.rows[0] };
        } else {
            return { success: false, token_info: null };
        }
    },
    addToken: async (customer_id, token) => {
        let sql = `INSERT INTO customer_reset_password_token (customer_id, token)
                    VALUES ($1, $2)`;
        const result = await client.query(sql, [customer_id, token]);
        return (result.rowCount === 1);
    },
    deleteToken: async (token) => {
        let sql = `DELETE 
                    FROM customer_reset_password_token
                    WHERE token = $1`;
        await client.query(sql, [token]);
        return true;
    }
};