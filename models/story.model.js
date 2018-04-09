const mongoose = require('mongoose');
const INTEREST_TYPES = require('./interest-types.js');

const storySchema = new mongoose.Schema(
{
  header: {
    type: String,
  },
  subheader: {
    type: String,
  },
  abstract: {
    type: String,
 
  },
  text: {
    type: String,

  },
  categories: [{
    type: String,
    enum: INTEREST_TYPES
  }],
  image: {
    type: String,
    default: 'https://s3.eestatic.com/2015/11/10/enfoques/Fiscalia-Audiencia_Nacional-Independencia-Declaracion_unilateral_de_independencia-Investidura-Artur_Mas-Sedicion-Enfoques_78252331_158516_1706x960.jpg'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
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

const Story = mongoose.model("Story", storySchema);
module.exports = Story;