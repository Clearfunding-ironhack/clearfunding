const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Campaign = require('../models/campaign.model');
const mongoose = require('mongoose');
const dateUtils = require('../utils/date.utils');

module.exports.create = (req, res, next) => {


  if (req.file) {
    image = req.file.secure_url;
    console.log(image)
  }

  const campaign = new Campaign({
      title: req.body.title,
      image: image,
      description: req.body.description,
      target: req.body.target,
      dueDate: req.body.dueDate,
      categories: req.body.categories,
      creator: req.user.id,
      abstract: req.body.abstract
    })
  
  campaign.save()
    .then(() => {
      res.status(201).json(campaign)
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.message));
      } else {
        console.log('entro aqui');
        next(new ApiError(error.message, 500))
      }
    });
  }


module.exports.list = (req, res, next) => {
  let now = new Date()
  console.log(now)
  Campaign.find()
    .then((campaigns) => res.status(201).json(campaigns))
    .catch(error => next(new ApiError(error.message)))
}


module.exports.get = (req, res, next) => {
  console.log("hola")
  const id = req.params.id;
  Campaign.findById(id)
    .populate('creator')
    .then(campaign => {
      console.log(campaign)
      if (campaign) {
        const remainingTime = dateUtils.getRemainingTime(campaign.dueDate);
        
        res.status(201).json(campaign)
      } else {
        next(new ApiError("Campaign not found", 404));
      }
    }).catch(error => next(error));
}

module.exports.getByCategory = (req, res, next) => {
  const category = req.query.category;
  console.log(category)
  Campaign.find({"categories": category})
    .then(campaign => {
      console.log(campaign)
      if (campaign) {
        console.log(campaign)
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

module.exports.follow = (req, res, next) => {
  const id = req.params.id;
  console.log(req.user.id);
  Campaign.update({ _id: id }, {$addToSet: { followers: req.user.id }})
  .then(() => {
   User.update({_id: req.user.id}, {$addToSet: { campaignsFollowed: id }})
   .then(() => {
     Campaign.findById(id).then((campaign) => {
      res.status(200).json({ message: campaign})
     })
   })
   .catch(error => next(error));
 })
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
      next(new ApiError(error.message));
    } else {
      (new ApiError(error.message, 500));
    }
  });
}