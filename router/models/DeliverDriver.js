// Load packages
const config = require('../../config');
const { Client } = require('pg');

// Connect to database
const client = new Client(config.connection);
client.connect();

module.exports = {
    getAllDeliverDrivers: async () => {
        let sql = `SELECT *
                    FROM deliver_driver`;
        const results = await client.query(sql);
        return results.rows;
    },
    UpdateDriverAvatar: async (deliver_driver_id, avatar_url) => {
        let sql = `UPDATE deliver_driver
                    SET avatar_url = $1
                    WHERE deliver_driver_id = $2`;
        const result = await client.query(sql, [avatar_url, deliver_driver_id]);
        return (result.rowCount === 1);
    }
};