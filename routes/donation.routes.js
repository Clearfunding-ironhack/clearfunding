const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');

router.post('/:id/pay', donationController.pay);
router.get('/success', donationController.executePayment);


module.exports = router;