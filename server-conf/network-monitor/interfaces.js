/**
 * Node wrapper for accessing and configuring unix interfaces
 */

var exec = require('child_process').exec;

var ifconfig_fields = {
	"ip_addr": /inet addr:([^\s]+)/,
	"bcast_addr": /Bcast:([^\s]+)/,
	"netmask": /Mask:([^\s]+)/,
	"mac_addr": /HWaddr\s([^\s]+)/
};

function parseBlock(block, fields){
	var output = {};
	for(var key in ifconfig_fields){
		var re = block.match(ifconfig_fields[key]);
		if(re && re.length > 1){
			output[key] = re[1];
		} else {
			output[key] == null;
		}
	}

	// check if interface is running
	var running = block.search('RUNNING') != -1;
	output["running"] = running; 

	return output;
}

function parseInterfaces(output){
	var lines = output.split('\n');
	var string = "";
	var blocks = {};
	lines.forEach(function(line){
		if(line.trim().length == 0 && string.length > 0){
			var ifaceName = string.substring(0, string.indexOf(' ')).trim();
			var iface = parseBlock(string, ifconfig_fields);
			iface["name"] = ifaceName;
			blocks[ifaceName] = iface;
			string = "";
		}
		string += line;
	});
	
	return blocks;
}

/**
 * Returns the network info for a given interface
 */
function ifconfig(iface, cb){
	var cmd = 'ifconfig';
	if(iface !== null){
		cmd += " " + iface;
	}
	exec(cmd, function(error, stdout, stderr){
		if(error){
			cb(error);
		} else {
			var ifaces = parseInterfaces(stdout);
			cb(null, ifaces);
		}
	});
}

/**
 * Bring up interface
 */
function ifup(iface, cb){
	console.log('bringing up interface: ' + iface);
	exec('ifup ' + iface, function(error, stdout, stderr){
		console.log(stdout);
		cb(error);
	});
}

/**
 * Bring down interface
 */
function ifdown(iface, cb){
	console.log('bringing down interface: ' + iface);
	exec('ifdown ' + iface, function(error, stdout, stderr){
		console.log(stdout);
		cb(error);
	});
}

/**
 * Sets the ip address and netmask of an interface
 */
function configureInterface(iface, ipAddress, netmask, cb){
	if(iface === null || iface.length == 0){
		throw "Invalid interface";
	}
	// TODO: need validation of ip
	if(ipAddress === null || ipAddress.length == 0){
		throw "Invalid IP Address";
	}
	var cmd = "ifconfig " + iface + " " + ipAddress;
	// TODO: need validation of netmask
	if(netmask !== null && netmask.length > 0){
		cmd += " netmask " + netmask;
	}
	exec(cmd, function(error, stdout, stderr){
		cb(error);
	});
}

/**
 * Try to renew dhcp lease of interface
 */
function renewDHCP(iface, cb){
	if(iface === null || iface.length == 0){
		throw "Invalid interface";
	}
	var cmd = "/sbin/dhclient " + iface;
	console.log('renewing dhcp lease on: ' + iface);
	exec(cmd, function(error, stdout, stderr){
		console.log(stdout);
		cb(error);
	});
}

module.exports = {
	ifconfig: ifconfig,
	ifup: ifup,
	ifdown: ifdown,
	configureInterface: configureInterface,
	renewDHCP: renewDHCP
};
