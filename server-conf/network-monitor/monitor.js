/**
 * This script monitors the network state of a certain inteface.
 * It's expected to run at a certain interval to check for the following:
 * 1.) Is wlan0 up
 * 2.) Does it have a valid IP address?
 * 		If yes: 
 *			Is it using a preset static IP?
 *				If yes:
 *					- We're running in AP mode
 *					- make sure hostapd and dnsmasq are running
 *					- at certain intervals, try to reestablish connection to known access point
 *				If no:
 *					- We're running in Client mode, should check for a valid internet connection
 *					- Make sure hostapd and dnsmasq are turned off
 *		If no:
 * 			- We probably lost connection as a Client
 *			- set wlan0 to use a static IP in the range of dnsmasq's configuration
 *			- turn on hostapd and dnsmasq
 */

var os = require('os');

var interfaces = require('./interfaces');

function getIPAddres(interfaceName){
	var ifaces = os.networkInterfaces();
	var ipAddress = "";
	console.log(JSON.stringify(ifaces, null, 2)); 
	ifaces[interfaceName].forEach(function(iface){
		if('IPv4' !== iface.family || iface.internal !== false){
			return;
		}
		ipAddress = iface.address;
	});
	return ipAddress;
}




/*** MAIN ***/

var ifaceName = "wlan0";

// console.log("wlan0 current ip: " + getIPAddres(ifaceName));
interfaces.ifconfig(null, function(error, ifaces){
	console.log("error: " + error);
	console.log("ifaces: " + JSON.stringify(ifaces, null, 2));
});