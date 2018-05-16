require('dotenv').config();
const passport = require('passport');
const ApiError = require('../models/api-error.model');
const async = require('async');
const crypto = require('crypto');
const mailer = require('../notifiers/mail.notifier');
const User = require('../models/user.model');
const PROVIDER = "localhost:4200";
const latch = require('latch-sdk');

module.exports.create = (req, res, next) => {
  const {email, password} = req.body;

  if(!email || !password) {
    next(new ApiError("Email and password are required"))
  }
  else {
    passport.authenticate('local-auth', (error, user, message) => {
      if(error){
        next(error)
      } else if(!user){
        next(new ApiError(message, 401))
      } else {
        console.log(user)
        if (user.LatchId){
          latch.status(user.LatchId, function(err, data) {
            if(data["data"]["operations"][process.env.LATCH_APP_ID]["status"] == "on"){
              console.log('validation passed');
              req.login(user, (error) => {
                if(error){
                  next(new ApiError(error.message, 500))
                } else {
                  res.status(201).json(req.user)
                }
              })
            } else {
              console.log('validation failed');
              next(new ApiError("Password is not correct or user may have activated a second-factor authentication"));
            }
          })
        } else {
          req.login(user, (error) => {
            if(error){
              next(new ApiError(error.message, 500))
            } else {
              res.status(201).json(req.user)
            }
          })
        }
      }
    })(req, res, next)
  }
};

module.exports.destroy = (req, res, next) => {
  req.session.destroy()
  req.user = null;
  res.status(204).json();
};

module.exports.forgot = (req, res, next) => {
  const email = req.body.email;
  let token;
  const to = email;
  const subject = 'Clearfunding Password Reset';

  const generateToken = new Promise((resolve, reject) => {
    crypto.randomBytes(20, function(err, buf) {
      if(err) {
        reject(err)
      }
      else {
        token = buf.toString('hex');
        console.log(`This is the token: ${token}`);
        resolve(token)
      }
    });
  });

  generateToken.then(User.findOne({"email": email })
      .then(user => {
        if (!user) {
          console.log('No user was found with that email');
          html = `We are sorry but there is no user in our database with email ${email}`;
          mailer.emailNotifier(to, subject, html);
          // redirigir a login
          //enviar email diciendo que no se ha encontrado el usuario  
        } else {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save()
            .then(() => {
              let html = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p> Please click on the following link, or paste this into your browser to complete the process:
              'http://${PROVIDER}/sessions/reset/${token}'</p><p> If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
              mailer.emailNotifier(to, subject, html);
              res.status(201).json('Email sent');
            })
            .catch(error => next(error));
        }
      })
      .catch(error => next(error))
    )
    .catch(error => next(error))
  }
 
  
module.exports.reset = (req, res, next) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then( user => {
          if(!user) {
            console.log('Password reset token is invalid or has expired.');
            res.status(400).json(new ApiError('User not found', 500))
          }
          else {
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            const to = user.email;
            const subject = 'Your Clearfunding Password has been changed';
            let html = `<p>Hi, ${user.username}, </p> <p>This is a confirmation that the password for your clearFunding account ${user.email} has just been changed.</p>`;
            user.save()
            .then(user => {
              mailer.emailNotifier(to, subject, html, user);
              res.status(201).json('Email sent')
            })
            .catch(error => next(error))
          }
        })
        .catch ( error => next(error))
  }
  

  
