/**
 * This script monitors the network state of a certain inteface.
 * It's expected to run at a certain interval to check for the following:
 * 1.) Is wlan0 up
 * 2.) Does it have a valid IP address?
 * 		If yes: 
 *			Is it using a preset static IP?
 *				If yes:
 *					- We're running in AP mode
 *					- make sure hostapd and dnsmasq are running
 *					- at certain intervals, try to reestablish connection to known access point
 *				If no:
 *					- We're running in Client mode, should check for a valid internet connection
 *					- Make sure hostapd and dnsmasq are turned off
 *		If no:
 * 			- We probably lost connection as a Client
 *			- set wlan0 to use a static IP in the range of dnsmasq's configuration
 *			- turn on hostapd and dnsmasq
 */


var async = require('async');
var interfaces = require('./interfaces');
var hostapd = require('./hostapd');
var dnsmasq = require('./dnsmasq');

var ifaceName = "wlan0";
var staticIP = "192.168.100.1";
var netmask = "255.255.255.0";

function reestablishConnection(iface, callback){
	// reset the network interface
	var name = iface['name'];
	async.series([
			function(next){
				async.setImmediate(function(){
					interfaces.ifdown(name, function(error){
						next(error);
					});
				});
			},
			function(next){
				async.setImmediate(function(){
					interfaces.ifup(name, function(error){
						next(error);
					});
				});
			},
			function(next){
				async.setImmediate(function(){
					interfaces.renewDHCP(name, function(error){
						next(error);
					});
				});
			}
		],
		callback);
}

function verifyServices(enable, callback){
	async.series([
			function(next){
				hostapd.isRunning(function(running, pid){
					if(enable){
						if(running){
							hostapd.restart(function(error){
								next(error);
							});
						} else {
							hostapd.start(function(error){
								next(error);
							})
						}
					} else {

						return next();
						// do not stop hostapd

						if(running){
							hostapd.stop(function(error){
								next(error);
							});
						} else {
							next();
						}
					}
				});
			},
			function(next){
				dnsmasq.isRunning(function(running, pid){
					if(enable){
						if(running){
							dnsmasq.restart(function(error){
								next(error);
							});
						} else {
							dnsmasq.start(function(error){
								next(error);
							})
						}
					} else {
						if(running){
							dnsmasq.stop(function(error){
								next(error);
							});
						} else {
							next();
						}
					}
				});
			}
		], callback);
}

function setupAPMode(iface, callback){
	async.series([
			function(next){
				interfaces.configureInterface(iface['name'], staticIP, netmask, function(error){
					next(error);
				});
			},
			function(next){
				hostapd.restart(function(error){
					next(error);
				});
			},
			function(next){
				dnsmasq.restart(function(error){
					next(error);
				});
			}
		],
		callback);	
}

function checkInterface(iface){
	var ipAddress = iface['ip_addr'];
	if(ipAddress != null){
		var inAPMode = (ipAddress == staticIP);
		if(inAPMode){
			reestablishConnection(iface, function(error, results){
				console.log("Trying to re-establish connection: " + error);
				runQuery();
			});
		} else {
			verifyServices(inAPMode, function(error, results){
				console.log("Verified services: " + error);
			});
		}
	} else {
		setupAPMode(iface, function(error, results){
			if(error){
				console.log("Failed to set up AP mode: " + error);
			} else {
				console.log("Switched to AP mode");
			}
		});
	}
}

function runQuery(){
	interfaces.ifconfig(ifaceName, function(error, ifaces){
		if(error){
			console.log("Unable to get interfaces: " + error);
			return;
		}
		var iface = ifaces[ifaceName];
		if(iface){
			console.log("interface name: " + iface['name']);
			console.log("interface ip: " + iface['ip_addr']);
			console.log("interface running: " + iface['running']);
			checkInterface(iface);
		} else {
			console.log("Interface not found...");
			// let's try to bring it up
			interfaces.ifup(ifaceName, function(error){
				// try again?
				if(!error){
					runQuery();					
				 } else {
				 	console.log("Failed to bring up interface:" + error);
				 }
			});
		}
	});
}

//setInterval(function(){
//	runQuery();
//}, 60000);

module.exports = {
	runQuery: runQuery
};
