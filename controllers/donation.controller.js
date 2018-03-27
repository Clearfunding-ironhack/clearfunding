const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk')

module.exports.pay = (req, res, next) => {

    const name = req.body.name;
    const price = req.body.price;
    const currency = req.body.currency;
    const campaignId = req.params.id;
    const paymentToken = "";
    const paymentId = "";
    const PayerID = "";
    const payerMail = "";
    const payedMail = "";
    
    console.log(req.params)
    
    const newDonation = new Donation({name, price, currency, campaignId, paymentId, PayerID, payedMail});
    console.log(newDonation)
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/donations/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": newDonation.name,
                    "sku": "001",
                    "price": newDonation.price,
                    "currency": newDonation.currency,
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": newDonation.currency,
                "total": newDonation.price
            },
            "description": "Hat for the best team ever"
        }]
  }
  paypal.payment.create(create_payment_json, function (error, payment) {
      console.log(create_payment_json)
    if (error) {
        console.log(error)
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
            console.log(payment.links[i].href)
            var link = (payment.links[i].href)
            let paymentToken = link.slice(-20);
            newDonation.paymentToken = paymentToken
            console.log(newDonation)
            newDonation.save()
            .then(() => {
              res.status(201).json(donation)
            })
            .catch(error => {
              if (error instanceof mongoose.Error.ValidationError) {
                next(new ApiError(error.message));
              } else {
                (new ApiError(error.message, 500))
              }
            });
          }
        }
    }
  });
}

module.exports.executePayment = (req, res) => {
    const paymentToken = req.query.token;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(req.query);
    console.log(payerId)
    console.log(paymentId)
    console.log(typeof paymentToken)
    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': 'Aa7GX-HChZfUEUjgFYIJqTS64BQHABs_gUlW3bqLnPut9kT9Tk_naKAaccYazKn-Pyb-a-7biWsLJ4tb',
        'client_secret': 'EEXpsbrP5AVCqxmqK4mLuhHs2o7bKsSjwGydmohV4z04iT-psvRN5P6q_4cDKj7VhUW1uU0FqkzGjtej'
      });
      const execute_payment_json = {
        "payer_id": payerId,
      };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(payment)
          console.log(JSON.stringify(payment));
          console.log(payment.transactions[0].payee.email)
          
          Donation.findOneAndUpdate({paymentToken: paymentToken}, 
            {$set: {paymentId: paymentId, PayerID: payerId, state: payment.state, payerMail: payment.payer.payer_info.email, payedMail:payment.transactions[0].payee.email}}, {upsert: true}, function(err,doc) {
            if (err) { throw err; }
            else { console.log("Updated"); }
          });
          res.send('Success');
      }
  })
  };