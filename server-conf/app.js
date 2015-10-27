var express    = require("express");
var bodyParser = require('body-parser');

var networkMonitor = require('./network-monitor');
var networkConfigure = require('./network-configure');

var app = express();
app.use(bodyParser.json());

// set up routes
app.get("/api/enable_wifi", function(request, response){
	console.log("incoming request..");
	response.end("world");
});

app.get("/api/wifi", function(request, response){
	networkConfigure.iw.scan('wlan0', function(error, results){
		if(error){
			response.status(500).send(error);
		} else {
			response.json(results);
		}
	});
});

// Listen on our server
 app.listen(8080);
 console.log("server running...");

// network monitor
console.log("starting network monitor...");
networkMonitor.run();
setInterval(function(){
	networkMonitor.run();
}, 1000 * 60 * 5); // every 5 minutes
