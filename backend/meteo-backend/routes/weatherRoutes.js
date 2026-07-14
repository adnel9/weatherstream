var express = require('express');
var router = express.Router();

const weatherController = require('../controllers/weatherController')

router.post('/', weatherController.getCityWeather);
router.get('/', weatherController.getdefaultWeather);

module.exports = router;
