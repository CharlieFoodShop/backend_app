// Load packages
const config = require('../../config');
const nodemailer = require('nodemailer');

// Method to send message
module.exports = async (email_address, subject, text) => {
    let transporter = nodemailer.createTransport({
        host: config.email_account.host,
        port: config.email_account.port,
        secure: true,
        auth: {
            user: config.email_account.user,
            pass: config.email_account.pass
        }
    });
    await transporter.sendMail({
        from: config.email_account.user,
        to: email_address,
        subject: subject,
        text: text
    });
    return true;
}