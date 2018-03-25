const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.create);
router.get('/', userController.list);
router.get('/:id', userController.get);
router.put('/:id', userController.edit);
router.delete('/:id', userController.delete);


module.exports = router;