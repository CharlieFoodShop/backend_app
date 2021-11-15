// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getAllQuestionAnswer: async () => {
        let sql = `SELECT *
                    FROM question_answer`;

        let results = await client.query(sql);
        return results.rows;
    }
};