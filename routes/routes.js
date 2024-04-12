const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller');

router.get('/', (req, res) => {
  res.send('Hello World');
});

router.get('/user/:userId/position', userController.getUserPosition);
router.get('/users/positions', userController.getAllUserPositions);

module.exports = router;
