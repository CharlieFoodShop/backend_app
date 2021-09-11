// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    addFoodOption: async (food_item_id, food_option_name) => {
        let sql = `INSERT INTO food_option (food_item_id, food_option_name)
                    VALUES ($1, $2)
                    RETURNING food_option_id`;
        const result = await client.query(sql, [food_item_id, food_option_name]);
        if (result.rowCount === 1) {
            return { success: true, food_option_id: result.rows[0].food_option_id }
        } else {
            return { success: false, food_option_id: null }
        }
    },
    getAllFoodOptionByItemId: async (food_item_id) => {
        let sql = `SELECT *
                    FROM food_option
                    WHERE food_item_id = $1`;
        const results = await client.query(sql, [food_item_id]);
        return results.rows;
    },
    updateFoodOption: async (food_option_id, food_option_name) => {
        let sql = `UPDATE food_option
                    SET food_option_name = $2
                    WHERE food_option_id = $1`;
        const result = await client.query(sql, [food_option_id, food_option_name]);
        return (result.rowCount === 1);
    },
    deleteFoodOption: async (food_option_id) => {
        let food_option_detail_sql = `DELETE FROM food_option_detail
                                        WHERE food_option_id = $1`;
        let food_option_sql = `DELETE FROM food_option
                                WHERE food_option_id = $1`;
        await client.query(food_option_detail_sql, [food_option_id]);
        await client.query(food_option_sql, [food_option_id]);
        return true;
    }
};