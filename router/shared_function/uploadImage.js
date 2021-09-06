// Load packages
const path = require('path');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const Busboy = require('busboy');
const config = require('../../config');


// Method to upload image
module.exports = async (req, res, upload_type) => {
    /**
     * Upload Type
     * Customer Avatar - 1
     * Deliver Driver Avatar - 2
     * Food Image - 3
     * Food Shop Image - 4
     * Manager Avatar - 5
     */

    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {

        let stream = file;
        let new_filename = Date.now() + path.extname(filename).toLocaleLowerCase();

        let url = "";
        switch (upload_type) {
            case 1:
                url = "customer_avatar/";
                break;
            case 2:
                url = "deliver_driver_avatar/";
                break;
            case 3:
                url = "food_image/";
                break;
            case 4:
                url = "food_shop_image/";
                break;
            case 5:
                url = "manager_avatar/";
                break;
            default:
                return res.status(400).json({ success: false, message: 'Please give valid upload type' });
        }
        const target = path.join('public/' + url, new_filename);
        const writeStream = fs.createWriteStream(target);

        try {
            await awaitWriteStream(stream.pipe(writeStream));
            return res.status(201).json({ success: true, message: config.url.static_file + url + new_filename });
        } catch (err) {
            await sendToWormhole(stream);
            throw err.message;
        }

    });
    req.pipe(busboy);
}