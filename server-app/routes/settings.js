var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('responds with settings info');
});

router.post('/', function(req, res, next){
  res.send('submits settings info');
});

module.exports = router;
