const Donation = require('../models/donation.model');
const mongoose = require('mongoose');
const ApiError = require('../models/api-error.model');
const Campaign = require('../models/campaign.model');
const User = require('../models/user.model');

module.exports.addAmountToCampaign = (paymentToken, amount) => {
    Donation.findOne({
        paymentToken: paymentToken,
        state: "approved"
      })
      .then(donation => {
        if (donation) {
          Campaign.findOneAndUpdate({
              "paymentTokens": paymentToken
            }, {
              $inc: {
                "amountRaised": amount
              }
            }, {new: true})
            .then(() => console.log("Amount added to the campaign"))
            .catch(error => {
              res.status(500)
            })
        } else {
          console.log(error);
        }
      })
      .catch(error => {
        if (error instanceof mongoose.Error.ValidationError) {
          console.log(error);
        } else {
          (new ApiError(error.message, 500));
        }
      })
}

module.exports.addAmountToUser = (paymentToken, amount) => {
  Donation.findOne({
      paymentToken: paymentToken,
      state: "approved"
    })
    .then(donation => {
      if (donation) {
        User.findOneAndUpdate({
            "paymentTokens": paymentToken

          }, {
            $inc: {
              "committedAmount": amount
            }
          }, {
            new: true
          })
          .then(() => console.log("Amount added to the user"))
          .catch(error => {
            res.status(500)
          })
      } else {
        console.log(error);
      }
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        console.log(error);
      } else {
        (new ApiError(error.message, 500));
      }
    })
}

