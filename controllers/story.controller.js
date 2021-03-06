const ApiError = require('../models/api-error.model');
const User = require('../models/user.model');
const Story = require('../models/story.model');
const mongoose = require('mongoose');

module.exports.create = (req, res, next) => {
  const story = new Story(req.body);
  if (req.file) {
    story.image = req.file.secure_url;
  }
  if (req.body.text) {
    story.estimatedReadingTime = Math.round((req.body.text.split(' ').length)/275);
  }
  // if (req.body.text) {
  //   const estimatedReadingTime = (req.body.text.split(' ').length)/275;
  //   console.log(estimatedReadingTime)
  // }
  story.save()
    .then((story) => {
      console.log(story)
      res.status(201).json(story)
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        console.log("errrrro")
        next(new ApiError(error.message));
      } else {
        console.log('entro aquiasfasd');
        next(new ApiError(error.message, 500))
      }
    });
  }


module.exports.list = (req, res, next) => {
  Story.find()
    .then((story) => res.status(201).json(story))
    .catch(error => next(new ApiError(error.message)))
}


module.exports.get = (req, res, next) => {
  const id = req.params.id;
  Story.findById(id)
    .then(story => {
      console.log(story)
      if (story) {
        res.status(201).json(story)
      } else {
        next(new ApiError("Story not found", 404));
      }
    }).catch(error => next(error));
}

module.exports.edit = (req, res, next) => {
  const id = req.params.id;
  Story.findByIdAndUpdate(id, {
      $set: req.body
    }, {
      new: true
    })
    .then(story => {
      if (story) {
        res.status(201).json(story)
      } else {
        next(new ApiError("Story not found", 404));
      }
    }).catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ApiError(error.message));
      } else {
        (new ApiError(error.message, 500));
      }
    });
}

module.exports.delete = (req, res, next) => {
  const id = req.params.id;
  Story.findByIdAndRemove(id)
    .then(story => {
      if (story) {
        res.status(204).json("Story deleted successfully")
      } else {
        next(new ApiError("Story not found", 404));
      }
    }).catch(error => new ApiError(error.message, 500));
}

module.exports.like = (req, res, next) => {
  const id = req.params.id;
  Story.update({ _id: id }, {$addToSet: { likes: req.user.id }})
  .then(() => {
   User.update({_id: req.user.id}, {$addToSet: { likedPublications: id }})
   .then(() => {
     res.status(204).json("User added to likes and story added to likedPublications successfully")
   })
   .catch(error => console.log(error));
 })
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
      next(new ApiError(error.message));
    } else {
      (new ApiError(error.message, 500));
    }
  });
}