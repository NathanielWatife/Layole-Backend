const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Example routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getAUser);
router.post('/', UserController.createAUser);
router.put('/:id', UserController.updateAUser);
router.delete('/:id', UserController.deleteAUser);

module.exports = router;
