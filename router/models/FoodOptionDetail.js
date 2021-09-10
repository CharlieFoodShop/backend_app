// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodOptionDetail: async (food_option_id, food_option_detail_name, add_price) => {
        let sql = `INSERT INTO food_option_detail(food_option_id, food_option_detail_name, add_price)
                    VALUES($1, $2, $3)
                    RETURNING food_option_detail_id`;
        const result = await client.query(sql, [food_option_id, food_option_detail_name, add_price]);
        if (result.rowCount === 1) {
            return { success: true, food_option_detail_id: result.rows[0].food_option_detail_id }
        } else {
            return { success: false, food_option_detail_id: null }
        }
    },
    getAllFoodOptionDetailByOptionId: async (food_option_id) => {
        let sql = `SELECT *
                    FROM food_option_detail
                    WHERE food_option_id = $1`;
        const results = await client.query(sql, [food_option_id]);
        return results.rows;
    },
    updateFoodOptionDetail: async (food_option_detail_id, food_option_detail_name, add_price) => {
        let sql = `UPDATE food_option_detail
                    SET food_option_detail_name = $2, add_price = $3
                    WHERE food_option_detail_id = $1;`;
        const result = await client.query(sql, [food_option_detail_id, food_option_detail_name, add_price]);
        return (result.rowCount === 1);
    },
    deleteFoodOptionDetail: async (food_option_detail_id) => {
        let sql = `DELETE FROM food_option_detail
                    WHERE food_option_detail_id = $1`;
        const result = await client.query(sql, [food_option_detail_id]);
        return (result.rowCount === 1);
    }
};