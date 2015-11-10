var express = require('express');
var router = express.Router();

router.param('id', function(req, res, next, id){
	req.sensorId = id;
	next();
});

router.get('/', function(req, res, next){
	// return all sensors
	res.json([]);
});

router.get('/:id', function(req, res, next){
	var sensor = {
		id: req.sensorId
	};
	res.json(sensor);
});

router.get('/:id/historical', function(req, res, next){
	var results = {
		id: req.sensorId,
		records: []
	};
	res.json(results);
});

module.exports = router;