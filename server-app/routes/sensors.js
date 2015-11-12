var express = require('express');
var router = express.Router();
var sensors  = require('../models').Sensor;
var records = require('../models').Record;

router.param('id', function(req, res, next, id){
	req.nodeId = id;
	next();
});

router.get('/', function(req, res, next){
	// return all sensors
	sensors.all().then(function(results){
		res.json(results);
	});
});

router.get('/:id', function(req, res, next){
	sensors.findOne({where: {address: req.nodeId}}).then(function(sensor){
		if(sensor != null){
			res.json(sensor);
		} else {
			res.status(404).json({error: 'Sensor not found'});
		}
	});
});

router.get('/:id/historical', function(req, res, next){
	records.findAll({where: {address: req.nodeId}}).then(function(results){
		res.json(results);
	});
});

module.exports = router;
