// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getMatchFoodCategoryExample: async (content) => {
        let sql = `SELECT *
                    FROM food_category_example
                    WHERE UPPER(food_category_example_name) LIKE concat(Upper($1), '%')`;
        const results = await client.query(sql, [content]);
        return results.rows;
    }
};

