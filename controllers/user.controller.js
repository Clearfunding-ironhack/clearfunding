const mongoose = require('mongoose');
const User = require('../models/user.model');
const passport = require('passport');
const ApiError = require('../models/api-error.model');


module.exports.create =  (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (user != null) {
            res.json('User already exists');
        } else {
            const {username, email, password, interests} = req.body;
            const newUser = new User({username, email, password,interests});
            newUser.save()
                .then((userCreated) => {
                    res.status(201).json(userCreated);
                }).catch(error => {
                    if (error instanceof mongoose.Error.ValidationError) {
                        console.log(error);
                        next(new ApiError(error.errors));
                    } else {
                        next(new ApiError(error.message, 500));
                    }
                });
        }
    }).catch(error => next(new ApiError(error.message, 500)));
  }


module.exports.list = (req, res, next) => {
    User.find()
      .then((users) => res.status(201).json(users))
      .catch(error => next(new ApiError(error.message)))
  }
  
  module.exports.get = (req, res, next) => {
    const id = req.params.id;
    User.findById(id)
      .then(user => {
        if (user) {
          res.status(201).json(user)
        } else {
          next(new ApiError("User not found", 404));
        }
      }).catch(error => next(error));
  }
  
  module.exports.edit = (req, res, next) => {
    const id = req.params.id;
    User.findByIdAndUpdate(id, {$set: req.body}, {new: true})
      .then(user => {
        if (user) {
          res.status(201).json(user)
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
  }

  module.exports.edit = (req, res, next) => {
    const id = req.params.id;
    const updatedUser = req.body
    User.findOne({'id': id })
      .then(user => {
        if (user) {
        user = updatedUser;
        user.Save()
        .then("funciona")
        .catch("No funciona")}
      }
    )
  }

  module.exports.delete = (req, res, next) => {
    const id = req.params.id;
    User.findByIdAndRemove(id)
      .then(user => {
        if (user) {
          res.status(204).json()
        } else {
          next(new ApiError("User not found", 404));
        }
      }).catch(error => new ApiError(error.message, 500));
  }