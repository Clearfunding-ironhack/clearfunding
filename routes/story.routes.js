const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

const secureMiddleware = require('../middlewares/secure.middleware');
const upload = require('../configs/multer.config');

router.post('/', upload.single('image'), secureMiddleware.isAuthenticated, storyController.create);
router.get('/', storyController.list);
router.get('/:id', storyController.get);
router.put('/:id', secureMiddleware.isAuthenticated, storyController.edit);
router.delete('/:id', secureMiddleware.isAuthenticated, storyController.delete);
router.put('/:id/follow', secureMiddleware.isAuthenticated, storyController.like);

module.exports = router;