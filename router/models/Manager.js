// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    checkManagerExisted: async (email_address, phone) => {
        let sql = `SELECT *
                    FROM manager
                    WHERE email_address = $1 OR phone = $2`;
        const results = await client.query(sql, [email_address, phone]);
        if (results.rows.length > 0) {
            return true;
        } else {
            return false;
        }
    },
    insertNewManagerToDatabase: async (first_name, last_name, email_address, phone, password_hash, created_at, updated_at) => {
        let sql = `INSERT INTO manager(first_name, last_name, email_address, phone, password_hash, created_at, updated_at)
                    VALUES($1, $2, $3, $4, $5, $6, $7)`;
        const result = await client.query(sql, [first_name, last_name, email_address, phone, password_hash, created_at, updated_at]);
        return (result.rowCount === 1);
    }
};