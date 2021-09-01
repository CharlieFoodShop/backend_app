// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    checkToken: async (token, manager_id) => {
        let sql = `SELECT *
                    FROM manager_reset_password_token
                    WHERE token = $1 OR manager_id = $2`;
        const results = await client.query(sql, [token, manager_id]);
        if (results.rows.length > 0) {
            return { success: true, token_info: results.rows[0] };
        } else {
            return { success: false, token_info: null };
        }
    },
    addToken: async (manager_id, token) => {
        let sql = `INSERT INTO manager_reset_password_token (manager_id, token)
                    VALUES ($1, $2)`;
        const result = await client.query(sql, [manager_id, token]);
        return (result.rowCount === 1);
    },
    deleteToken: async (token) => {
        let sql = `DELETE 
                    FROM manager_reset_password_token
                    WHERE token = $1`;
        await client.query(sql, [token]);
        return true;
    }
};