const mongoose = require('mongoose');
const INTEREST_TYPES = require('./interest-types.js');

const campaignSchema = new mongoose.Schema(
{
  title: {
    type: String,
  },
  image: {
    type: String,
    default: 'https://s3.eestatic.com/2015/11/10/enfoques/Fiscalia-Audiencia_Nacional-Independencia-Declaracion_unilateral_de_independencia-Investidura-Artur_Mas-Sedicion-Enfoques_78252331_158516_1706x960.jpg'
  },
  target: {
    type: Number,
  
  },
  amountRaised: {
    type: Number,
    default: 0
  },
  isAchieved: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
  
  },
  location: {
    type: [ Number ],
    index: '2dsphere'
  },
  dueDate: {
    type: Date
  },
  categories: {
    type: String,
    enum: INTEREST_TYPES
  },
  paymentTokens: [{
    type: String,
    default: []
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  backers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
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

const Campaign = mongoose.model("Campaign", campaignSchema);
module.exports = Campaign;