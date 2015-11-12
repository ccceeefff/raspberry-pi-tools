var http = require('http');
var Record = require('../models').Record;

function Uploader(host, port){
	this.host = host;
	this.port = port;
}

Uploader.prototype.run = function(){
	var self = this;
	Record.findAll({where : {submitted: 0}}).then(function(records){
		self.submit({
			macAddr: "1234",
			locLat: 1.23,
			locLong: 1.23
		}
			, records, function(error){
			if(error === null){
				records.forEach(function(record){
					record.submitted = 1;
					record.save();
				});
			}
		});
	});
};

/** 
 * Uploads an array of items to the cloud server
 */
Uploader.prototype.submit = function(gatewayInfo, items, next){
	var options = {
        hostname: this.host,
        port: this.port, 
        path: '/api/v1/submit',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var entries = [];
    items.forEach(function(item){
    	var entry = {
    		nodeId: item.nodeId,
    		rawValue: item.value,
    		timestamp: item.createdAt
    	};
    	entries.push(entry);
    });
    
    var data = {
    	gatewayId: gatewayInfo.macAddr,
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