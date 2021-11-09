// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    checkCustomerExisted: async (email_address, phone) => {
        let sql = `SELECT *
                    FROM customer
                    WHERE email_address = $1 OR phone = $2`;
        const results = await client.query(sql, [email_address, phone]);
        if (results.rows.length > 0) {
            return { success: true, existing_customer: results.rows[0] };
        } else {
            return { success: false, existing_customer: null };
        }
    },
    insertNewCustomerToDatabase: async (first_name, last_name, password_hash, email_address, phone, created_at, updated_at) => {
        let sql = `INSERT INTO customer(first_name, last_name, password_hash, email_address, phone, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const result = await client.query(sql, [first_name, last_name, password_hash, email_address, phone, created_at, updated_at]);
        return (result.rowCount === 1);
    },
    customerResetPassword: async (customer_id, password_hash) => {
        let sql = `UPDATE customer
                    SET password_hash = $1
                    WHERE customer_id = $2`;
        const result = await client.query(sql, [password_hash, customer_id]);
        return (result.rowCount === 1);
    },
    getCustomerDetailByEmailAddress: async (email_address) => {
        let sql = `SELECT customer_id, first_name, last_name, email_address, phone, avatar_url, address, lat, lon, created_at, updated_at
                    FROM customer
                    WHERE email_address = $1`;
        const result = await client.query(sql, [email_address]);
        return result.rows;
    },
    updateCustomerProfile: async (first_name, last_name, password_hash, email_address, phone, avatar_url, updated_at, address, lat, lon, customer_id) => {
        let sql = `UPDATE customer
                    SET first_name = $1, 
                        last_name = $2, 
                        password_hash = $3, 
                        email_address = $4, 
                        phone = $5, 
                        avatar_url = $6, 
                        updated_at = $7,
                        address = $8,
                        lat = $9,
                        lon = $10
                    WHERE customer_id = $11`;
        const result = await client.query(sql, [first_name, last_name, password_hash, email_address, phone, avatar_url, updated_at, address, lat, lon, customer_id]);
        return (result.rowCount === 1);
    },
    UpdateCustomerAvatar: async (customer_id, avatar_url) => {
        let sql = `UPDATE customer
                    SET avatar_url = $1
                    WHERE customer_id = $2`;
        const result = await client.query(sql, [avatar_url, customer_id]);
        return (result.rowCount === 1);
    }
};