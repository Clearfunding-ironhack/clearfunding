const User = require('../models/user.model');
const LocalStrategy = require('passport-local').Strategy;


//Passport config

module.exports.setup = (passport) => {

  //serialize and deserialize user
  passport.serializeUser((user, next) => {
    next(null, user.id);
  });

  passport.deserializeUser((id, next) => {
    User.findById(id)
    .then (user => {
      next(null, user);
    })
    .catch(error => next(error));
    });
    //Local strategy
    passport.use('local-auth', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
  }, (email, password, next) => {
      User.findOne({ email: email})
          .then(user => {
              if (!user) {
                  next(null, user, { password: 'Invalid username or password' });
              } else {
              
                  user.checkPassword(password)
                      .then(match => {
                          if (match) {
                              next(null, user);
                          } else {
                              next(null, null, { password: 'Invalid username or password' });
                          }
                      })
                      .catch(error => next(error));
              }
          })
          .catch(error => next(error));
  }));
}