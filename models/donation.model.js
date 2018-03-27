const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
{
  name: {
    type: String
  },
  price: {
    type: String
  },
  currency: {
    type: String
  },
  campaignId: {
    type: mongoose.Schema.Types.String,
    ref: 'Campaign'
  },
  PayerID: {
    type: String
  },
  paymentId: {
    type: String
  },
  paymentToken: {
    type: String
  },
  state: {
    type: String,
    default: "Non approved"
  },
  payerMail: {
    type: String
  },
  payedMail: {
    type: String
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

const Donation = mongoose.model("Donation", donationSchema);
module.exports = Donation;