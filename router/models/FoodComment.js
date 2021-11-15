// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getManagerCommentListByItemId: async (food_item_id) => {
        let sql = `SELECT food_comment_id, comment, rating, fc.created_at, first_name, last_name, avatar_url
                    FROM food_comment fc
                    JOIN customer c
                    ON fc.customer_id = c.customer_id
                    WHERE fc.food_item_id = $1
                    ORDER BY fc.created_at DESC`;
        const results = await client.query(sql, [food_item_id]);
        return results.rows;
    },


    getCustomerFoodCommentRating: async (email_address, food_item_id) => {
        let sql = `SELECT food_comment_id, comment, rating, food_comment.created_at
                    FROM food_comment
                    JOIN customer
                    ON food_comment.customer_id = customer.customer_id
                    WHERE email_address = $1 AND food_item_id = $2`;
        const results = await client.query(sql, [email_address, food_item_id]);
        return results.rows;
    },
    getCustomerFoodCommentRatingDetailById: async (food_comment_id) => {
        let sql = `SELECT food_comment_id, comment, rating, food_comment.created_at, food_name, image_url
                    FROM food_comment
                    JOIN food_item
                    ON food_comment.food_item_id = food_item.food_item_id
                    WHERE food_comment_id = $1`;
        const results = await client.query(sql, [food_comment_id]);
        if (results.rows.length > 0) {
            return { success: true, food_comment_detail: results.rows[0] };
        } else {
            return { success: false, food_comment_detail: null };
        }
    },
    addNewFoodComment: async (food_item_id, customer_id, comment, rating, created_at) => {
        let sql = `INSERT INTO food_comment (food_item_id, customer_id, comment, rating, created_at)
                    VALUES ($1, $2, $3, $4, $5)`;
        const result = await client.query(sql, [food_item_id, customer_id, comment, rating, created_at]);
        return result.rowCount === 1;
    },
    editFoodComment: async (comment, rating, food_comment_id) => {
        let sql = `UPDATE food_comment
                    SET comment = $1, rating = $2
                    WHERE food_comment_id = $3`;
        const result = await client.query(sql, [comment, rating, food_comment_id]);
        return result.rowCount === 1;
    },
    deleteFoodComment: async (food_comment_id) => {
        let sql = `DELETE FROM food_comment
                    WHERE food_comment_id = $1`;
        await client.query(sql, [food_comment_id]);
        return true;
    }
};