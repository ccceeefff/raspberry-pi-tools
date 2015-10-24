/**
 * Simple node wrapper for accessing dnsmasq
 * Assumes this runs with super user privilege
 */

var exec = require('child_process').exec;

function isRunning(cb) {
	exec('pidof dnsmasq', function(error, stdout, stderr){
		if(error){
			// hostapd is not running
			cb(false);
		} else {
			cb(true, stdout);
		}
	});
}

function start(cb){
	exec('/etc/init.d/dnsmasq start', function(error, stdout, stderr){
		cb(error);
	});
}

function stop(cb){
	exec('/etc/init.d/dnsmasq stop', function(error, stdout, stderr){
		cb(error);
	});
}

module.exports = {
	isRunning: isRunning,
	start: start,
	stop: stop
}
