const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');

const secureMiddleware = require('../middlewares/secure.middleware');

router.get('/', donationController.list);
router.post('/:id/pay', secureMiddleware.isAuthenticated, donationController.pay);
router.get('/success', donationController.executePayment);



module.exports = router;