var express = require('express');
var router = express.Router();
var models  = require('../models');

router.get('/', function(req, res, next) {
  var record = models.Record.build({
    nodeId: 'abcde',
    value: 12345,
    timestamp: Date.now() / 1000, // Timetamp in seconds
    submitted: 0
  });

  record.save().then(function() {
    models.Record.findAll()
      .then(function(data) {
        console.log(data);
        res.send('responds with settings info');
      });
  });
});

router.post('/', function(req, res, next){
  res.send('submits settings info');
});

module.exports = router;
