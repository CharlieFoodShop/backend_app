const crypto = require('crypto');
const config = require('../../config');

const encrypt = (text) => {

    const cipher = crypto.createCipheriv(
        config.paypal.paypal_algorithm,
        config.paypal.paypal_secretKey,
        Buffer.from(config.paypal.paypal_iv, 'hex'));

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return encrypted.toString('hex');
};

const decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(
        config.paypal.paypal_algorithm,
        config.paypal.paypal_secretKey,
        Buffer.from(config.paypal.paypal_iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
};