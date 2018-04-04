const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../configs/paypal.config');
const donationUtils = require('../utils/donation.utils');
const dateUtils = require('../utils/date.utils');

module.exports.pay = (req, res, next) => {

  const campaignId = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const currency = req.body.currency;
  const paymentToken = "";
  const paymentId = "";
  const PayerID = "";
  const payerMail = "";
  const payedMail = "";

  Campaign.findById(campaignId)
  .then(campaign => {
    const remainingTime = dateUtils.getRemainingTime(campaign.dueDate)
    if(remainingTime < 0){
      console.log("CAMPAÑA CERRADA")
      Campaign.findByIdAndUpdate(campaignId, {
        $set: {
          isCompleted: "true"
        }
      }, {
        new: true
      })
      .then(() => res.status(201).json({
          message: 'Success'
        }))
      .catch(error => {
          res.status(500)
        })
    } else {
      const newDonation = new Donation({
        name,
        price,
        currency,
        campaignId,
        paymentId,
        PayerID,
        payedMail,
        payerMail
      });
    
      const create_payment_json = paypalConfig.createPayment(newDonation);
    
      paypal.payment.create(create_payment_json, function (error, payment) {
        const user = req.user;
        if (error) {
          console.log(error)
          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              console.log(payment.links[i].href)
              let paymentToken = payment.links[i].href.slice(-20);
    
              //get token of the transaction
              newDonation.paymentToken = paymentToken
              user.paymentTokens.push(newDonation.paymentToken)
              user.save()
    
              //save token to the campaign
              Campaign.findByIdAndUpdate(campaignId, {
                  $push: {
                    paymentTokens: newDonation.paymentToken
                  }
                }, {
                  new: true
                })
                .then(() => res.status(201).json({
                    message: 'Success'
                  }))
                .catch(error => {
                    res.status(500)
                  })
    
                // Save new donation to donations db  
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
      })
    }
  }
  )
  .catch(error => console.log(error));
}

module.exports.executePayment = (req, res) => {
 
  const paymentToken = req.query.token;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {

    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));

      Donation.findOneAndUpdate({
          paymentToken: paymentToken
        }, {
          $set: {
            paymentId: paymentId,
            PayerID: payerId,
            state: payment.state,
            payerMail: payment.payer.payer_info.email,
            payedMail: payment.transactions[0].payee.email
          }
        }, {upsert: true})
        .then(() => {
          const amount = Number(payment.transactions[0].amount.total);
          donationUtils.addAmountToCampaign(paymentToken, amount);
          donationUtils.addAmountToUser(paymentToken, amount);
        })
        .catch(error => console.log(error))
    }
    res.send('Success');
  })
};

