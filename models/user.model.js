const mongoose = require('mongoose');
const INTEREST_TYPES = require('./interest-types.js');
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema(
{
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
    default: 'https://www.linkteachers.com/frontend/foundation/images/dummy_user/default_image.jpg'
  },
  interests: [{
    type: String,
    enum: INTEREST_TYPES
  }],
  PayerID: {
    type: String,
  },
  DNI: {
    type: String,
  },
  campaignsFollowed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  }],
  campaignsBacked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  }],
  campaignsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  }],
  committedAmount: {
    type: 'Number'
  },
  disbursedAmount: {
    type: 'Number'
  },
  paymentTokens: [{
    type: 'String'
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = doc._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }

});



userSchema.pre('save', function (next) {
  const user = this;
  bcrypt.genSalt(SALT_WORK_FACTOR)
      .then(salt => {
          bcrypt.hash(user.password, salt)
              .then(hash => {
                  user.password = hash;
                  next();
              });
      })
      .catch(error => next(error));
});



userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.encryptPasswordAgain = function (password) {
  return bcrypt.genSalt(SALT_WORK_FACTOR)
      .then(salt => {
          bcrypt.hash(password, salt)
              .then(hash => {
                  password = hash;
              });
      })
      .catch(error => console.log(error));
};



const User = mongoose.model('User', userSchema);
module.exports = User;