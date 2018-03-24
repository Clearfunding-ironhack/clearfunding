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