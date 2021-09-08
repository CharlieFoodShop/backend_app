// Load packages
const path = require('path');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const Busboy = require('busboy');
const config = require('../../config');


// Method to upload image
module.exports = async (req, res, upload_type, id, database_function) => {
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


        let file_dir = path.join('public/' + url, id);
        if (fs.existsSync(file_dir)) {
            fs.rmdirSync(file_dir, { recursive: true });
        }
        fs.mkdirSync(file_dir);


        const target = path.join(file_dir, new_filename);
        const writeStream = fs.createWriteStream(target);

        try {
            await awaitWriteStream(stream.pipe(writeStream));

            let final_url = (path.join(config.url.api_url, target)).replace(/\\/g, '/');
            await database_function(id, final_url);
            return res.status(201).json({ success: true, message: final_url });
        } catch (err) {
            await sendToWormhole(stream);
            throw err.message;
        }

    });
    req.pipe(busboy);
}