var express = require('express');
var router = express.Router();
var models  = require('../models');

/*
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
*/
/*
 * my temporary sqlite storage
 */

function getSettings(next){
	model.Settings.findOrCreate({where: {id: 1}, defaults: {
		name: "",
		cloud_server_address: "",
		poll_interval: 0,
		submission_interval: 0,
		locLat: 0.0,
		locLong: 0.0
	}}).spread(function(settings, created){
		next(settings);
	});
}

/* GET users listing. */
router.get('/', function(req, res, next) {
	getSettings(function(settings){
		res.json(settings);	
	})d
});

router.post('/', function(req, res, next){
	settings.name = req.body.name;
	settings.cloud_server_address = req.body.cloud_server_address;
	settings.poll_interval = req.body.poll_interval;
	settings.submission_interval = req.body.submission_interval;
	settings.location.lat = req.body.location.lat;
	settings.location.long = req.body.location.long;
	settings.updated_at = Math.floor(new Date() / 1000);
	res.json(settings);
});

module.exports = router;
