var express = require('express');
var router = express.Router();

const usersController = require('../controllers/usersController')

router.post('/register', usersController.addUser);
router.post('/login', usersController.loginUser);
router.get('/favorites', usersController.authenticate, usersController.getCities);
router.post('/favorites', usersController.authenticate, usersController.addFavoriteCity);
router.delete('/favorites', usersController.authenticate, usersController.deleteFavoriteCity);

module.exports = router;