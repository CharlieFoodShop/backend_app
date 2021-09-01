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
            return { success: true, existing_employee: results.rows[0] };
        } else {
            return { success: false, existing_employee: null };
        }
    },
    insertNewManagerToDatabase: async (first_name, last_name, email_address, phone, password_hash, created_at, updated_at) => {
        let sql = `INSERT INTO manager(first_name, last_name, email_address, phone, password_hash, created_at, updated_at)
                    VALUES($1, $2, $3, $4, $5, $6, $7)`;
        const result = await client.query(sql, [first_name, last_name, email_address, phone, password_hash, created_at, updated_at]);
        return (result.rowCount === 1);
    },
    emailResetPassword: async (manager_id, password_hash) => {
        let sql = `UPDATE manager
                    SET password_hash = $1
                    WHERE manager_id = $2`;
        const result = await client.query(sql, [password_hash, manager_id]);
        return (result.rowCount === 1);
    }
};