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

module.exports.list = (req, res, next) => {
 Donation.find()
    .then((donations) => res.status(201).json(donations))
    .catch(error => next(new ApiError(error.message)))
}

module.exports.pay = (req, res, next) => {

  const campaignId = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const currency = req.body.currency;
  const userId = req.user.id;
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
        userId,
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
                    message: 'Success',
                    paypalLink: payment.links[i].href
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

      Donation.findOneAndUpdate({paymentToken: paymentToken }, {
          $set: {
            paymentId: paymentId,
            PayerID: payerId,
            state: payment.state,
            payerMail: payment.payer.payer_info.email,
            payedMail: payment.transactions[0].payee.email,
            saleID: payment.transactions[0].related_resources[0].sale.id
          }
        }, {upsert: true})
        .populate('userId')
        .then((donation) => {
          const userID = donation.userId;
          const amount = Number(payment.transactions[0].amount.total);
          
          Promise.all([
            addAmountToCampaign(paymentToken, amount),
            addAmountToUser(paymentToken, amount),
            addDataToCampaign(paymentToken)
          ])
          .then(data => { 
            const campaign = data[0];
            const user = data[1];
           sendConfirmationEmail(campaign, user);
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
            .populate('backers').populate('creator').populate('followers')
            .then(campaign => {
              if (campaign) {
                evaluateAchievement(campaign);
                campaign.percentageAchieved = (campaign.amountRaised / campaign.target) * 100;
                console.log(campaign);
                campaign.save()
                  .then(() => {
                    User.findOne({"paymentTokens": paymentToken})
                    .then(user => {
                      console.log(campaign.backers.indexOf(user.id))
                      console.log(campaign.backers)
                        if (campaign.backers.some(backer => backer.id === user.id)) {
                          console.log("User has already contributed to this campaign");    
                        } else {
                          campaign.backers.push(user.id)
                          campaign.save()
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
        .then(user => resolve(user))
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
    
        Campaign.findOneAndUpdate({"paymentTokens": paymentToken},{$push: {"paymentInfo": paymentInfo}})
        .then(user => resolve(user) )
        .catch(error =>  res.status(500));
      } else {
        reject(new Error('Donation not found'));
      }
    })
    .catch(error => reject(error));
});
}


function evaluateAchievement(campaign) {
  const to = campaign.backers.map(backer => backer.email);

  if (campaign.amountRaised >= campaign.target && !campaign.isAchieved) {
    campaign.isAchieved = true;
    const subject = `${campaign.title} campaign was achieved. Congrats!`;
    const html = `${campaign.title} has been completed!`;
    mailer.multipleEmailNotifier(to, subject, html);
  } else if (campaign.amountRaised >= campaign.target * 0.8 && !campaign.isAlmostAchieved) {
    campaign.isAlmostAchieved = true;
    const subject = `${campaign.title} campaign is 80% achieved`;
    const html = `${campaign.title} is about to be completed! Help us now!`;
    mailer.multipleEmailNotifier(to, subject, html);
  
  }
}
 
function sendConfirmationEmail(campaign, user){
  let to = user.email;
  let subject = `${campaign.creator.username} wanted to personally thank you for your contribution to ${campaign.title}`
  let html = `<h1> Hello ${user.username} </h1> <p> Your contribution to ${campaign.title} is much appreciated.
    So far we have managed to achieve ${campaign.amountRaised} USD. Thank you very much! We will notify you as soon as the 
    deadline is met!</p> <p> BTW! Did we mention we wanted to thank you? :) </p>'`;
    mailer.emailNotifier(to, subject, html);
}