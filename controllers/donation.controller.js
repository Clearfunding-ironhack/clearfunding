const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk')


module.exports.pay = (req, res, next) => {

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/succes",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat for the best team ever"
        }]
  }
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        console.log(error)
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
            console.log(payment.links[i].href)
          }
        }
    }
  });  
}

module.exports.executePayment = (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(payerId)
    console.log(paymentId)
    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': 'Aa7GX-HChZfUEUjgFYIJqTS64BQHABs_gUlW3bqLnPut9kT9Tk_naKAaccYazKn-Pyb-a-7biWsLJ4tb',
        'client_secret': 'EEXpsbrP5AVCqxmqK4mLuhHs2o7bKsSjwGydmohV4z04iT-psvRN5P6q_4cDKj7VhUW1uU0FqkzGjtej'
      });
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
          console.log("HOLaaaasdasboasbcihsabcias")
      }
  });
  };