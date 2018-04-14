require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const passport = require('passport');
const ApiError = require('../models/api-error.model');
const latch = require('latch-sdk');


module.exports.create =  (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (user != null) {
            res.json('User already exists');
        } else {
            const {username, email, password, interests} = req.body;
            if (req.file) {
              image = req.file.secure_url;
            }
            const newUser = new User({username, email, password, interests});
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
    })//.catch(error => next(new ApiError(error.message, 500)));
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
      })
  }

  module.exports.changePassword = (req, res, next) => {
    const id = req.params.id;
    User.findById(id, function (err, user) {
      if (user) {
          user.save({id, password: req.body.password})
            .then((userPasswordUpdated) => {
            res.status(201).json(userPasswordUpdated);
        }).catch(error => {
            if (error instanceof mongoose.Error.ValidationError) {
                console.log(error);
                next(new ApiError(error.errors));
            } else {
                next(new ApiError(error.message, 500));
            }
        });
      }
    })
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

  module.exports.pairLatch = (req, res, next) => {
      var pairResponse = latch.pair(req.query.code, function(err, data) {
        console.log(data)
        if (data["data"]["accountId"]) {
          User.findByIdAndUpdate(req.user.id, {$set: {LatchId: data["data"]["accountId"]}})
            .then((usersaved) => {
              res.status(204).json()
            }).catch(error => {
              next(new ApiError("User not found", 404))}
            )
        } else if (data["error"]) {
            var message = "There has been an error with Latch, try again";
            res.render("setup", { user: req.user, message: message, accountId: "" });
        }
});
  }

