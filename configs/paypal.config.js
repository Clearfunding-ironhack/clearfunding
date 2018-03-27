const paypal = require('paypal-rest-sdk');

module.exports.configure = ({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });

  
  
  