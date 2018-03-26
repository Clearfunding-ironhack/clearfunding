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
  quantity: {
    type: Number, 
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