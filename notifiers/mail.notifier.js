require('dotenv').config();
const mailer = require('../configs/nodemailer.config');


module.exports.emailNotifier = (to, next) => {
  const subject = 'This is my first mail using nodemailer';
  const html = 'Campaign almost achieved';

  send(mailer.FROM, to, subject, html);
}


function send(from, to, subject, html, next){
  options = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html// plain text body
  }

  mailer.transporter.sendMail(options)
    .then(message => {
      console.log("MENSAJE DE NODEMAILER")
      console.log(message)
    })
    .catch(err => console.log(err))
    //, function (err, info) {
//     if (err) {
//       next(err);
//     } else {
//       console.log('Email sent successfully. The following is info:')
//       console.log(info);
//       next();
//     }
//  })
}