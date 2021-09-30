// Load packages
const config = require('../../config');
const request = require('request');

module.exports = (req, res, next) => {
    const captcha_secretkey = config.captcha_secretkey;
    const captcha = req.body.captcha;

    if (!captcha)
        return res.status(400).json({ success: false, message: "Please check captcha!" });

    const verity_url = `https://www.google.com/recaptcha/api/siteverify?secret=${captcha_secretkey}&response=${captcha}`;
    request(verity_url, (err, respond, body) => {
        body = JSON.parse(body);

        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!body.success || body.score < 0.4) {
            return res.status(400).json({ success: false, message: "Failed captcha verification", score: body.score });
        }

        next();
    });

}