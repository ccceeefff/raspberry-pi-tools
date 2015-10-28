var express    = require("express");
var bodyParser = require('body-parser');

var networkMonitor = require('./network-monitor');
var networkConfigure = require('./network-configure');

var app = express();
app.use(bodyParser.json());

// set up routes
app.get("/ping", function(request, response){
	console.log("incoming request..");
	response.end("Hello, world!");
});

app.post("/api/wifi/configure", function(request, response){
	// we need 2 things
	// 1. What the SSID is
	// 2. What the password is, if applicable
	// if a password is given, we will assume this is a wpa encrpyted network
	// else, we will assume this is an unsecure network
	var ssid = request.body.ssid;
	var pass = request.body.password;

	if(ssid != null && ssid.length > 0){
		var msg = "";
		if(pass != null && pass.length > 0){
			msg = "Setting up gateway WiFi with WPA";
			networkConfigure.wifiManager.setupWPA('wlan0', ssid, pass, function(error){
				networkMonitor.run();
			});
		} else {
			msg = "Setting up gateway WiFi with ESSID";
			networkConfigure.wifiManager.setupESSID('wlan0', ssid, function(error){
				networkMonitor.run();
			});
		}
		response.json({
			msg: msg,
			ssid: ssid,
			pass: pass
		});
	} else {
		response.status(400).json({
			msg: "Invalid parameters"
		});
	}
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

