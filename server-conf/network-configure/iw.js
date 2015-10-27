/**
 * Node wrapper for iw command line tool
 */

var exec = require('child_process').exec;

var IW_COMMAND = "/home/pi/tools/iw-4.3/iw";  // this has to reside somewhere
var SCAN_BLOCK_START = "BSS";

var bss_fields = {
	"ssid": /SSID:\s([^\s]+)/,
	"frequency": /freq:\s([^\s]+)/,
	"signal_strength": /signal:\s([^\s]+)/,
	"beacon_interval": /beacon interval:\s([^\s]+)/,
	"last_seen": /last seen:\s([^\s]+)/,
	"channel": /DS Parameter set: channel\s([^\s]+)/,
	"mac_addr": /BSS\s([^\s]+)\(/ 
};

function parseBlock(block, fields){
var output = {};
	for(var key in fields){
		var re = block.match(fields[key]);
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
		if(line.indexOf(SCAN_BLOCK_START) === 0){
			if(block != null){
				blocks.push(parseBlock(block, bss_fields));
			}
			block = "";
		}
		block += line;
	});

	if(block != null){
		blocks.push(parseBlock(block, bss_fields));
	}

	return blocks;
}

function scan(ifaceName, cb){
	if(ifaceName === null || ifaceName.length == 0){
		throw "Interface name cannot be null";
	}

	var cmd = IW_COMMAND + " dev " + ifaceName + " scan ap-force";
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
