const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../configs/paypal.config');
const donationUtils = require('../utils/donation.utils');
const dateUtils = require('../utils/date.utils');
const mailer = require('../notifiers/mail.notifier');

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

  // refund();

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
            payedMail: payment.transactions[0].payee.email,
            saleID: payment.transactions[0].related_resources[0].sale.id
          }
        }, {upsert: true})
        .then(() => {
          const amount = Number(payment.transactions[0].amount.total);
          Promise.all([
            addAmountToCampaign(paymentToken, amount),
            addAmountToUser(paymentToken, amount),
            addDataToCampaign(paymentToken)

          ])
          .then(() => { 
              console.log("llego aqui");
              mailer.emailNotifier('cgferneco@gmail.com, bsanser@gmail.com');
              res.json({ message: 'OK'});
          })
          .catch(error => console.log(error));
        })
        .catch(error => console.log(error))
    }
  })
};

function addAmountToCampaign(paymentToken, amount) {
  return new Promise((resolve, reject) => {
    Donation.findOne({ paymentToken: paymentToken, state: "approved"})
      .then(donation => {
        if (donation) {
          Campaign.findOneAndUpdate(
            { "paymentTokens": paymentToken }, 
            { $inc: { "amountRaised": amount } }, 
            { new: true })
            .then(campaign => {
              if (campaign) {
                campaign.evaluateAchivement();
                campaign.save()
                  .then(() => {
                    User.findOne(
                      {"paymentTokens": paymentToken}).then(user => {
                        if (campaign.backers.indexOf(user.id) !== -1) {
                          console.log("User has already contributed to this campaign");
                        } else {
                          console.log(`Antes del push, los backers: ${campaign.backers}`);
                          console.log(`Antes del push, el userId: ${user.id}`);
                          campaign.backers.push(user.id)
                          campaign.save()
                          console.log(`Despues del push, los backers: ${campaign.backers}`);
                          console.log(`Despues del push, el userId: ${user.id}`);
                        } resolve(campaign);
                      })
                  })
                  .catch(error => reject(error));
              } else {
                reject(new Error('Campaign not found'));
              }
            })
            .catch(error => console.log(error))
        } else {
          reject(new Error('Donation not found'));
        }
      })
      .catch(error => reject(error));
  });
}

function addAmountToUser(paymentToken, amount) {
  return new Promise((resolve, reject) => {
    Donation.findOne({paymentToken: paymentToken,state: "approved"})
    .then(donation => {
      if (donation) {
        User.findOneAndUpdate(
          {"paymentTokens": paymentToken},
          {$inc: {"committedAmount": amount}, $addToSet:{"campaignsBacked": donation.campaignId}},
          {new: true })
        .then((user) => resolve())
        .catch(error =>  res.status(500));
      } else {
        reject(new Error('Donation not found'));
      }
    })
    .catch(error => reject(error));
});
}

function addDataToCampaign(paymentToken) {
  return new Promise((resolve, reject) => {
    Donation.findOne({paymentToken: paymentToken,state: "approved"})
    .then(donation => {
      if (donation) {
        const paymentInfo = {
          saleID: donation.saleID,
          data: {
            price: donation.price,
            currency: donation.currency
          }
        }

        console.log(paymentInfo)


        Campaign.findOneAndUpdate(
          {"paymentTokens": paymentToken},
          {$push: {"paymentInfo": paymentInfo}})
        .then((user) => resolve())
        .catch(error =>  res.status(500));
      } else {
        reject(new Error('Donation not found'));
      }
    })
    .catch(error => reject(error));
});
}


 
// function refund(campaignID) {
//   return new Promise((resolve, reject) =>{
//     Campaign.findById(campaignID)
//     .then(campaign => {
//       // campaign.paymentTokens.forEach((paymentToken) => {
//         Donation.find({"paymentToken": campaign.paymentTokens.indexOf(paymentTokens) !== -1})
//         .then(donation => console.log(donation))
//         .catch(error => console.log(`Error 1: ${error}`))
//       })
//     }
//     )
//     .catch(error => console.log(`Error 2: ${error}`))
//   })
//   .then(resolve())
//   .catch(reject())
// };