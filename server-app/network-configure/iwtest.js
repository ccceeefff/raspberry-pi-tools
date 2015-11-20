var iw = require('./iw');

console.log("Scanning for APs: ");
iw.scan('wlan0', function(error, results){
	if(error){
		console.log("failed: " + error);
		return;
	}
	console.log(JSON.stringify(results, null, 2));
});
