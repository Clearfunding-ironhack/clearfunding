const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');

module.exports.pay = (req, res, next) => {

    const name = req.body.name;
    const price = req.body.price;
    const currency = req.body.currency;
    const campaign = req.params.id;
    const paymentToken = "";
    const paymentId = "";
    const PayerID = "";
    const payerMail = "";
    const payedMail = "";


    const newDonation = new Donation({
        name,
        price,
        currency,
        campaign,
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
            }, function (err, doc) {
                if (err) {
                    throw err;
                } else {
                    console.log("Updated");
                    console.log(doc);
                }
            });
            console.log(req.user);
            User.findOneAndUpdate({
                    _id: req.user._id
                }, {
                    $set: {
                        PayerID: payerId
                    }
                })
                .then(user => {
                    if (user) {
                        console.log(`The updated user is ${user}`);
                    } else {
                        next(new ApiError("User not found", 404));
                    }
                }).catch(error => {
                    if (error instanceof mongoose.Error.ValidationError) {
                        next(new ApiError(error.message));
                    } else {
                        (new ApiError(error.message, 500));
                    }
                });
            res.send('Success');
        }
    })
};