const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

const secureMiddleware = require('../middlewares/secure.middleware');


router.post('/', sessionController.create);
router.delete('/', secureMiddleware.isAuthenticated, sessionController.destroy);
router.post('/forgot', sessionController.forgot);
router.post('/reset/:token', sessionController.reset);

module.exports = router;