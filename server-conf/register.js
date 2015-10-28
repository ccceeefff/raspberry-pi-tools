var http = require('http');

var HOST = "";
var PORT = 80;

function register(ip_addr, mac_addr){
    var options = {
        hostname: HOST,
        port: PORT, 
        path: '/midi/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var data = {
    	'ip_addr' : ip_addr,
    	'mac_addr' : mac_addr
    };
    var params = this.getIPAddress() + ":" + this.port;
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
    req.write(JSON.stringify(data));
    req.end();
};

module.exports = {
	register: register
}