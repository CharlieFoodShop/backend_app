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
    },
    getManagerDetailByEmailAddress: async (email_address) => {
        let sql = `SELECT manager_id, first_name, last_name, email_address, phone, avatar_url, created_at, updated_at, client_id, client_secret_hash
                    FROM manager
                    WHERE email_address = $1`;
        const result = await client.query(sql, [email_address]);
        return result.rows;
    },
    updateManagerAccount: async (client_id, client_secret_hash, manager_id) => {
        let sql = `UPDATE manager
                    SET client_id = $1, client_secret_hash = $2
                    WHERE manager_id = $3`;
        const result = await client.query(sql, [client_id, client_secret_hash, manager_id]);
        return (result.rowCount === 1);
    },
    updateManagerProfile: async (first_name, last_name, email_address, phone, password_hash, avatar_url, updated_at, manager_id) => {
        let sql = `UPDATE manager
                    SET first_name = $1, 
                        last_name = $2, 
                        email_address = $3, 
                        phone = $4, 
                        password_hash = $5, 
                        avatar_url = $6, 
                        updated_at = $7
                    WHERE manager_id = $8`;
        const result = await client.query(sql, [first_name, last_name, email_address, phone, password_hash, avatar_url, updated_at, manager_id]);
        return (result.rowCount === 1);
    },
    UpdateManagerAvatar: async (manager_id, avatar_url) => {
        let sql = `UPDATE manager
                    SET avatar_url = $1
                    WHERE manager_id = $2`;
        const result = await client.query(sql, [avatar_url, manager_id]);
        return (result.rowCount === 1);
    }
};