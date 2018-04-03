const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const mongoose = require('mongoose');
const dateUtils = require('../utils/date.utils');



module.exports.create = (req, res, next) => {
  const campaign = new Campaign(req.body)
  campaign.save()
    .then(() => {
      res.status(201).json(campaign)
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.message));
      } else {
        (new ApiError(error.message, 500))
      }
    });
}

module.exports.list = (req, res, next) => {
  Campaign.find()
    .then((campaigns) => res.status(201).json(campaigns))
    .catch(error => next(new ApiError(error.message)))
}

module.exports.get = (req, res, next) => {
  const id = req.params.id;
  Campaign.findById(id)
    .then(campaign => {
      if (campaign) {
        res.status(201).json(campaign)
      } else {
        next(new ApiError("Campaign not found", 404));
      }
    }).catch(error => next(error));
}

module.exports.edit = (req, res, next) => {
  const id = req.params.id;
  Campaign.findByIdAndUpdate(id, {
      $set: req.body
    }, {
      new: true
    })
    .then(campaign => {
      if (campaign) {
        res.status(201).json(campaign)
      } else {
        next(new ApiError("Campaign not found", 404));
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.message));
      } else {
        (new ApiError(error.message, 500));
      }
    });
}

module.exports.delete = (req, res, next) => {
  const id = req.params.id;
  Campaign.findByIdAndRemove(id)
    .then(campaign => {
      if (campaign) {
        res.status(204).json("Campaign deleted successfully")
      } else {
        next(new ApiError("Campaign not found", 404));
      }
    }).catch(error => new ApiError(error.message, 500));
}