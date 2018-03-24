const mongoose = require('mongoose');
const INTEREST_TYPES = require('./interest-types.js');

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
  paypalAccount: {
    type: Number,
  },
  DNI: {
    type: String,
  },
  campaignsFollowed: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  },
  campaignsBacked: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  },
  campaignsCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Campaigns'
  },
  disbursedAmount: {
    type: 'Number'
  },
  committedAmount: {
    type: 'Number'
  }
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

const User = mongoose.model('User', userSchema);
module.exports = User;