var http = require('http');
var Record = require('../models').Record;
var Setting = require('../models').Setting;

function getSettings(next){
	Setting.findOrCreate({where: {id: 1}, defaults: {
		name: '',
		cloud_server_address: '',
		poll_interval: 0,
		submission_interval: 0,
		locLat: 0.0,
		locLong: 0.0
	}}).spread(function(settings, created){
		next(settings);
	});
}

function Uploader(){

}

Uploader.prototype.register = function(ipAddress, macAddress, next){
    getSettings(function(gatewayInfo){
        var options = {
            hostname: gatewayInfo.cloud_server_address,
            port: gatewayInfo.cloud_server_port,
            path: '/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var data = {
            'ip_addr' : ipAddress,
            'mac_addr' : macAddress
        };
        var req = http.request(options, function(res){
            res.on('data', function (chunk) {
                if(res.statusCode == 200){
                    next(null, chunk);
                } else {
                    next(new Error("Failed to register"));
                }
            });
        });
        req.on("error", function(e){
            next(e);
        });
        req.write(JSON.stringify(data));
        req.end();
    });
};

Uploader.prototype.run = function(){
	var self = this;
	getSettings(function(settings){
		Record.findAll({where : {submitted: 0}}).then(function(records){
			self.submit(settings, records, function(error){
				if(error === null){
					records.forEach(function(record){
						record.submitted = 1;
						record.save();
					});
				}
			});
		});
	});
};

/**
 * Uploads an array of items to the cloud server
 */
Uploader.prototype.submit = function(gatewayInfo, items, next){
	var options = {
        hostname: gatewayInfo.cloud_server_address,
        port: gatewayInfo.cloud_server_port,
        path: '/api/v1/submit',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var entries = [];
    items.forEach(function(item){
    	var entry = {
    		nodeId: item.address,
    		rawValue: item.value,
    		timestamp: item.createdAt
    	};
    	entries.push(entry);
    });

    var data = {
    	gatewayId: gatewayInfo.name,
    	locLat: gatewayInfo.locLat,
    	locLong: gatewayInfo.locLong,
    	entries: entries
    };

    var req = http.request(options, function(res){
        console.log('[Uploader] STATUS: ' + res.statusCode);
        console.log('[Uploader] HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('[Uploader] BODY: ' + chunk);
            next(null, data);
        });
    });
    req.on("error", function(e){
        console.log("[Uploader] Error with submission: " + e);
        next(e);
    })
    req.write(JSON.stringify(data));
    req.end();
}

module.exports = Uploader;
