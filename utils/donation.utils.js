const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../configs/paypal.config');
const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const mongoose = require('mongoose');
const dateUtils = require('../utils/date.utils');

function refund(currency, total, saleID){
  var data = {
    "amount": {
      "currency": currency,
      "total": total
    }
  }
 
  paypal.sale.refund(saleID, data, function(error, refund){
    if(error) {
      console.log(error)
      throw error;
    } else {
      console.log('Refund sale successful');
      console.log(JSON.stringify(refund));
    }
  })
 }
 
 module.exports.updateCompletedCampaign = () => {
  console.log("Entro a updateCOm")
  Campaign.find({"isAchieved": false, "isCompleted": false})
  .then(campaigns => campaigns.forEach((campaign) =>{
    if( dateUtils.getRemainingTime(campaign.dueDate) <= 0){
      campaign.isCompleted = true;
      campaign.save()
      .then(campaign => {
        campaign.paymentInfo.forEach((payment)=>{
          refund(payment.data.currency, payment.data.price, payment.saleID)
          })
      })
      .catch(error => console.log(error))
    }
  }))
  .catch(error => console.log(error))
 }