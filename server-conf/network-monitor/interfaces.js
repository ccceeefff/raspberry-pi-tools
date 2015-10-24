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
	return output;
}

function parseInterfaces(output){
	var lines = output.split('\n');
	var string = "";
	var blocks = {}};
	lines.forEach(function(line){
		if(['\t', ' '].indexOf(line[0]) === -1 && temp.length > 0){
			var ifaceName = string.substring(0, string.indexOf('\t'));
			var iface = parseBlock(string, ifconfig_fields);
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
	exec('ifup ' + iface, function(error, stdout, stderr){
		cb(error);
	});
}

/**
 * Bring down interface
 */
function ifdown(iface, cb){
	exec('ifdown ' + iface, function(error, stdout, stderr){
		cb(error);
	});
}

module.exports = {
	ifconfig: ifconfig,
	ifup: ifup,
	ifdown: ifdown
};