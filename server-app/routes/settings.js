var express = require('express');
var router = express.Router();
var model  = require('../models');

var validator = require('validator');

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
	model.Setting.findOrCreate({where: {id: 1}, defaults: {
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

function verify_data(data, next){
	var errorStr = null;
	// if(validator.isNull(data)){
	// 	errorStr = "Submission contains no data";
	// } else if(validator.isNull(data.name)){
	// 	errorStr = "Invalid name";
	// } else if(validator.isNull(data.cloud_server_address)){
	// 	errorStr = "Invalid server address";
	// } else if(!validator.isInt(data.submission_interval)){
	// 	errorStr = "Invalid submission interval";
	// } else if(!validator.isInt(data.poll_interval)){
	// 	errorStr = "Invalid poll interval";
	// } else if(validator.isNull(data.location)){
	// 	errorStr = "Invalid location";
	// } else if(!validator.isNumeric(data.location.lat)){
	// 	errorStr = "Invalid location latitude";
	// } else if(!validator.isNumeric(data.location.long)){
	// 	errorStr = "Invalid location longitude";
	// }
	console.log("error: " + errorStr);
	if(errorStr !== null){
		next(new Error(errorStr));
	} else {
		next();
	}
}

/* GET users listing. */
router.get('/', function(req, res, next) {
	getSettings(function(settings){
		res.json(settings);	
	});
});

router.post('/', function(req, res, next){
	// verify values
	verify_data(req.body, function(error){
		if(error){
			res.status(400).json({error: error.message});
		} else {
			getSettings(function(settings){
				settings.name = req.body.name;
				settings.cloud_server_address = req.body.cloud_server_address;
				settings.poll_interval = req.body.poll_interval;
				settings.submission_interval = req.body.submission_interval;
				settings.locLat = req.body.location.lat;
				settings.locLong = req.body.location.long;
				settings.save();
				res.json(settings);
			});
		}
	});
});

module.exports = router;
