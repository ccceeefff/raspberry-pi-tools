var express = require('express');
var router = express.Router();

var networkMonitor = require('../network-monitor');
var networkConfigure = require('../network-configure');
var async = require('async');
var Uploader = require('../controllers').Uploader;

var model  = require('../models');

var runningConfigureScripts = false;

function registerToCloudServer(next){
	var uploader = new Uploader();
	networkMonitor.interfaces.ifconfig('wlan0', function(error, ifaces){
		var wlan0 = ifaces['wlan0'];
		console.log('ip_addr: ' + wlan0.ip_addr);
		console.log('mac_addr: ' + wlan0.mac_addr);	
		uploader.register(wlan0.ip_addr, wlan0.mac_addr, function(){
			next();
		});
	});
}

router.post("/configure", function(request, response){
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
					console.log("Configured wifi... Verifying...");
				}
				registerToCloudServer(function(){
					networkMonitor.run();
					runningConfigureScripts = false;
				});
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

router.get("/list", function(request, response){
	networkConfigure.iw.scan('wlan0', function(error, results){
		if(error){
			response.status(500).send(error);
		} else {
			response.json(results);
		}
	});
});

router.checkWiFiState = function(){
	// dont run network monitor if we're undergoing a configuration request
	if(!runningConfigureScripts){
		networkMonitor.run();
	}
}

module.exports = router;