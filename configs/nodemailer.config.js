const nodemailer = require('nodemailer');
const FROM = 'clearfundingproject@gmail.com';

module.exports.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'clearfundingproject@gmail.com',
        pass: process.env.GMAIL_PASSWORD
    } 
  });

module.exports.FROM = FROM;