const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

const secureMiddleware = require('../middlewares/secure.middleware');
const upload = require('../configs/multer.config');

router.post('/', upload.single('image'), secureMiddleware.isAuthenticated, campaignController.create);
router.get('/', campaignController.list);
router.get('/category', campaignController.getByCategory);
router.get('/:id', campaignController.get);
router.put('/:id', secureMiddleware.isAuthenticated, campaignController.edit);
router.delete('/:id', secureMiddleware.isAuthenticated, campaignController.delete);
router.put('/:id/follow', secureMiddleware.isAuthenticated, campaignController.follow);

module.exports = router;