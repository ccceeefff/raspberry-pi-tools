/**
 * Simple node wrapper for accessing hostapd
 * Assumes this runs with super user privilege
 */

var exec = require('child_process').exec;

function isRunning(cb) {
	exec('pidof hostapd', function(error, stdout, stderr){
		if(error){
			// hostapd is not running
			cb(false);
		} else {
			cb(true, stdout);
		}
	});
}

function start(cb){
	console.log('starting hostapd');
	exec('/etc/init.d/hostapd start', function(error, stdout, stderr){
		cb(error);
	});
}

function stop(cb){
	console.log('stopping hostapd');
	exec('/etc/init.d/hostapd stop', function(error, stdout, stderr){
		cb(error);
	});
}

function restart(cb){
	console.log('restarting hostapd');
	exec('/etc/init.d/hostapd restart', function(error, stdout, stderr){
		cb(error);
	});
}

module.exports = {
	isRunning: isRunning,
	start: start,
	stop: stop,
	restart: restart
}
