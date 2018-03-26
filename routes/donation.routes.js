const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');

router.post('/pay', donationController.pay);
router.get('/succes', donationController.executePayment);


module.exports = router;