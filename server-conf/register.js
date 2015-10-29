var http = require('http');

var HOST = "10.0.16.130";
var PORT = 8080;

function register(ip_addr, mac_addr){
    var options = {
        hostname: HOST,
        port: PORT, 
        path: '/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var data = {
    	'ip' : ip_addr,
    	'mac' : mac_addr
    };
    var req = http.request(options, function(res){
        console.log('[NetworkManager] STATUS: ' + res.statusCode);
        console.log('[NetworkManager] HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('[NetworkManager] BODY: ' + chunk);
        });
    });
    req.on("error", function(e){
        console.log("[NetworkManager] Error with registration: " + e);  
    })
	console.log('sending data: ' + JSON.stringify(data));
    req.write(JSON.stringify(data));
    req.end();
};

module.exports = {
	register: register
}
