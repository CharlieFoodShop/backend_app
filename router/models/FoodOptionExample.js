// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getAllFoodOptionExample: async () => {
        let sql = `SELECT *
                    FROM food_option_example`;
        const results = await client.query(sql);
        return results.rows;
    }
};