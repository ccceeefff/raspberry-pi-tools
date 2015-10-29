var express    = require("express");
var bodyParser = require('body-parser');

var networkMonitor = require('./network-monitor');
var networkConfigure = require('./network-configure');

var async = require('async');
var register = require('./register');
var app = express();
app.use(bodyParser.json());

// set up routes
app.get("/ping", function(request, response){
	console.log("incoming request..");
	response.end("Hello, world!");
});

var runningConfigureScripts = false;

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
		} else {
			msg = "Setting up gateway WiFi with ESSID";
		}

		runningConfigureScripts = true;

		// disable hostapd and dnsmasq before starting
		async.waterfall([
				//disable hostapd
				function(next){
					networkMonitor.hostapd.stop(next);
				},
				function(next){
					networkMonitor.dnsmasq.stop(next);
				},
				function(next){
					if(pass != null && pass.length > 0){
						networkConfigure.wifiManager.setupWPA('wlan0', ssid, pass, next);
					} else {
						networkConfigure.wifiManager.setupESSID('wlan0', ssid, next);
					}
				}
			],
			function(error){
				if(error){
					console.log("Error configuring wifi: " + error);
				} else {
					console.log("Configrued wifi... Verifying...");
				}
				networkMonitor.run();
				runningConfigureScripts = false;
			});

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
	// dont run network monitor if we're undergoing a configuration request
	if(!runningConfigureScripts){
		networkMonitor.run();
	}
}, 1000 * 60 * 5); // every 5 minutes

setInterval(function(){
	networkMonitor.interfaces.ifconfig('wlan0', function(error, ifaces){
		var wlan0 = ifaces['wlan0'];
		console.log('ip_addr: ' + wlan0.ip_addr);
		console.log('mac_addr: ' + wlan0.mac_addr);
		register.register(wlan0.ip_addr, wlan0.mac_addr);
	});
}, 1000 * 10); // re-register every minute
