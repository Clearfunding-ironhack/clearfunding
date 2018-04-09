const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

cloudinary.config(
{
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'clearfunding',
  allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  filename: (req, file, next) => {
    next(undefined, 'clearfunding');
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      next(null, false, new Error('Only image files are allowed!'));
    } else {
      next(null, true);
    }
  }
});

module.exports = upload;