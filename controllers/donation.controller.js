const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');

const getRemainingTime = deadline => {
    let now = new Date(),
        remainingTime = (new Date(deadline) - now + 1000) / 1000, // lo pasamos a segundos. El +1000 es porque tiene una demora de 1 segundo en empezar y para que no vaya 1 seg atrasado.
        remainingSeconds = ('0' + Math.floor(remainingTime % 60)).slice(-2),
        remainingMinutes = ('0' + Math.floor(remainingTime / 60 % 60)).slice(-2),
        remainingHours = ('0' + Math.floor(remainingTime / 3600 % 24)).slice(-2),
        remainingDays = Math.floor(remainingTime/ (3600 * 24));
        
        return {
          remainingTime,
          remainingSeconds,
          remainingMinutes,
          remainingHours, 
          remainingDays
        }
  }
  
  const countdown = (deadline, finalMessage) => {
    const timerUpdate = setInterval(() => {
      let time = getRemainingTime(deadline);
      console.log(`${time.remainingDays} days, ${time.remainingHours}hours, ${time.remainingMinutes} minutes and ${time.remainingSeconds} seconds left for the end of the campaign`);
      
      if(time.remainingTime <= 1) {
        clearInterval(timerUpdate);
        console.log(finalMessage);
      }
      
    }, 1000)
    
  };

  const goalAchieved = (campaign) => {
    campaign.isAchieved = true;
  }
  
  const campaignFinished = (campaign) => {
      // if target is met
    if (campaign.isAchieved === true) {
        //1) transfer funds to the creator's account (do we have the account in the user model? Nope, we should add it)

        //2) update user's amount disbursed and committed amount in relation to the SPECIFIC campaign
             //amount disbursed (total for each campaign?) += committedAmount (campaign)
             //committedAmount(total) -= committedAmount(campaign)

        //3) notify creator, backers and followers (this notification should be a function since we will use it both in the if and else clauses)

    // if target is NOT met
    } else {
        // 1) refund users
        // 2) update user's amount disbursed and committed amount 
            // committedAmount (total) -= committedAmount (campaign);
        // 3) notify creator, backers and followers
    }
  }

  campaignAlmostFinished = (campaign) => {
      //for notifying stakeholders that the goal is 80% met
      if (this.campaign.amountRaised == this.campaign.goal * 0.8) {
       // notify creator, backers and followers that the goal is 80% met
      }
  }

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
            "description": "Payment"
        }]
    }
    paypal.payment.create(create_payment_json, function (error, payment) {
        const user = req.user;
        if (error) {
            console.log(error)
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                    console.log(payment.links[i].href)
                    var link = (payment.links[i].href)
                    let paymentToken = link.slice(-20);

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
                        .then(campaign => {
                            console.log(campaign)
                        })
                        .catch(error => {
                            console.log(error);
                        })

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
                }, {
                    upsert: true
                }).then(() => {
                    const amount = Number(payment.transactions[0].amount.total);
                    function addAmountToCampaign(paymentToken, amount) {
                        Donation.findOne({
                                paymentToken: paymentToken,
                                state: "approved"
                            })
                            .then(donation => {
                                if (donation) {
                                    Campaign.findOneAndUpdate({
                                            "paymentTokens": paymentToken
                                
                                        },{
                                            $inc: {
                                                "amountRaised": amount
                                            }
                                        }, {
                                            new: true
                                        })
                                        .then(campaign => {
                                            if (campaign) {
                                                console.log(`This is the campaign with the amount raised: ${campaign}`);
                                                let time = getRemainingTime(campaign.dueDate);
                                                console.log(`${time.remainingDays} days, ${time.remainingHours}hours, ${time.remainingMinutes} minutes and ${time.remainingSeconds} seconds left for the end of the campaign`);  

                                            } else {
                                                console.log(error);
                                            }
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        })
                                } else {
                                    console.log(error);
                                }
                            }).catch(error => {
                                if (error instanceof mongoose.Error.ValidationError) {
                                    console.log(error);
                                } else {
                                    (new ApiError(error.message, 500));
                                }
                            })
                    }
                    //Sumar amount a user.amountCommitted
                    function addAmountToUser(paymentToken, amount) {
                        Donation.findOne({
                                paymentToken: paymentToken,
                                state: "approved"
                            })
                            .then(donation => {
                                if (donation) {
                                    User.findOneAndUpdate({
                                            "paymentTokens": paymentToken
                                
                                        },{
                                            $inc: {
                                                "committedAmount": amount
                                            }
                                        }, {
                                            new: true
                                        })
                                        .then(user => {
                                            if (user) {
                                                console.log(`This is the user with the amount raised: ${user}`);
                                            } else {
                                                console.log(error);
                                            }
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        })
                                } else {
                                    console.log(error);
                                }
                            }).catch(error => {
                                if (error instanceof mongoose.Error.ValidationError) {
                                    console.log(error);
                                } else {
                                    (new ApiError(error.message, 500));
                                }
                            })
                    }
                    addAmountToCampaign(paymentToken, amount);
                    addAmountToUser(paymentToken, amount);

                })
                
                .catch(error => console.log(error))
            }

            
            res.send('Success');
        }
    )
};



// addAmount(donation) {
//     const netAmount = payment.transactions[0].amount.total - payment.transactions[0].related_resources[0].transaction_fee.value;
//     if(donation.status == "approved") {


//     }
// }