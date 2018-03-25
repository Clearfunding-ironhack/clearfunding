const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

router.post('/', campaignController.create);
router.get('/', campaignController.list);
router.get('/:id', campaignController.get);
router.put('/:id', campaignController.edit);
router.delete('/:id', campaignController.delete);

module.exports = router;