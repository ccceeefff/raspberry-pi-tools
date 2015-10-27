/**
 * Node wrapper for iw command line tool
 */

var exec = require('child_process').exec;

var IW_COMMAND = "./iw";  // this has to reside somewhere
var SCAN_BLOCK_START = "BSS";

var bss_fields = {
	"ssid": /SSID:\s([^\s]+)/,
	"frequency": /freq:\s([^\s]+)/,
	"signal_strength": /signal:\s([^\s]+)/,
	"beacon_interval": /beacon interval:\s([^\s]+)/,
	"last_seen": /last seen:\s([^\s]+)/,
	"channel": /DS Parameter set:\s([^\s]+)/
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

function parse(output){
	var lines = output.split('\n');
	var string = "";
	var blocks = [];
	var block = null
	lines.forEach(function(line){
		if(line.startsWith(SCAN_BLOCK_START)){
			if(block != null){
				blocks.append(parseBlock(block, bss_fields));
			}
			block = "";
		}
		block += line;
	});

	if(block != null){
		blocks.append(parseBlock(block, bss_fields));
	}

	return blocks;
}

function scan(ifaceName, cb){
	if(ifaceName === null || ifaceName.length == 0){
		throw "Interface name cannot be null";
	}

	var cmd = "sudo " + IW_COMMAND + " dev " + ifaceName + " scan ap-force";
	exec(cmd, function(error, stdout, stderr){
		if(error){
			return cb(error);
		}
		return cb(null, parse(stdout));
	});
}

module.exports = {
	scan: scan
};