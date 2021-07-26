// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getAllFoodCategoryExample: async () => {
        let sql = `SELECT *
                    FROM food_category_example`;
        const results = await client.query(sql);
        return results.rows;
    }
};

