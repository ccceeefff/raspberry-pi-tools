var exec = require('child_process').exec;
var async = require('async');
var _ = require('underscore')._;
var fs = require('fs');

// Better template format
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate :   /\{\[([\s\S]+?)\]\}/g
};

function logExec(cmd, callback){
	var fname = arguments.callee.caller.name;
	console.log("[" + fname + "]" + " Executing '" + cmd + "'");
	exec(cmd, function(error, stdout, stderr){
			console.log("[" + fname + "]" + "[stdout]\n" + stdout);
			console.log("[" + fname + "]" + "[stderr]\n" + stderr);
			callback(error);
	});
}

// Helper function to write a given template to a file based on a given
// context
function write_template_to_file(template_path, file_name, context, callback) {
    async.waterfall([

        function read_template_file(next_step) {
            fs.readFile(template_path, {encoding: "utf8"}, next_step);
        },

        function update_file(file_txt, next_step) {
            var template = _.template(file_txt);
            fs.writeFile(file_name, template(context), next_step);
        }

    ], callback);
}

function testNetworkConnection(iface, cb){
	// tests the specific interface if we have a network connection
	// sends 2 packets on iface with 2 second timeouts
	// if it responds, we're good, if not, we probably don't have 
	// internet connection
	var cmd = "ping -I " + iface + " -c 2 -w 2 www.google.com"; 
	logExec(cmd, function(error){
		cb(error);
	});
}

function rebootInterface(iface, cb){
	if(iface === null || iface.length == 0){
		throw "Interface cannot be null";
	}
	var cmd = "ifdown " + iface + "; ifup " + iface + ";";
	logExec(cmd, function(error){
		cb(error);
	});
}

function setupClientMode(iface, templateFile, context, cb){
	async.waterfall([
			// write ssid
			function(next){
				write_template_to_file(templateFile, '/etc/network/interfaces', context, next);
			},
			// reboot interface
			function(next){
				rebootInterface(iface, next);
			},
			// try to register
			function(next){
				testNetworkConnection(iface, next);
			}
		], function(error){
			if(error){
				console.log("Failed to setup client mode, falling back to AP mode: " + error);
			}
			cb(error);
		});
}

function setupESSID(iface, ssid, cb){
	var context = {
		wifi_ssid: ssid
	};

	setupClientMode(iface, './network-configure/templates/wifi.essid.template', context, function(error){
		cb(error);
	});
}	

function setupWPA(iface, ssid, password, cb){
	var context = {
		wifi_ssid: ssid,
		wifi_pass: password
	};

	setupClientMode(iface, './network-configure/templates/wifi.wpa.template', context, function(error){
		cb(error);
	});
}

module.exports = {
	setupESSID: setupESSID,
	setupWPA: setupWPA,
	rebootInterface: rebootInterface
};