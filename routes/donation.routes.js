const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');

router.get('/', donationController.list);
router.post('/:id/pay', donationController.pay);
router.get('/success', donationController.executePayment);



module.exports = router;