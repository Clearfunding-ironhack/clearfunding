const paypal = require('paypal-rest-sdk');
const paypalConfig = require('../configs/paypal.config');
const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const mongoose = require('mongoose');
const dateUtils = require('../utils/date.utils');


module.exports.refund = () => {
  var data = {
    "amount": {
      "currency": "USD",
      "total": "20.00"
    }
  }
  saleId="95U10637WJ3194522";
  paypal.sale.refund(saleId, data, (error, refund) => {
    if(error) {
      console.log(error)
      throw error;
    } else {
      console.log('Refund sale successful');
      console.log(JSON.stringify(refund));
    }
  });
}


module.exports.updateCompletedCampaign = () => {
  Campaign.find({"isAchieved": false, "isCompleted": false})
  .then(campaigns => campaigns.forEach((campaign) =>{
    console.log(campaign)
    console.log(dateUtils.getRemainingTime(campaign.dueDate))
    if( dateUtils.getRemainingTime(campaign.dueDate) <= 0){
      campaign.isCompleted = true;
      campaign.save();
    }
  }))
  .catch(error => console.log(error))
}

// 