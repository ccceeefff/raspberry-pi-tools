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


var interfaces = require('./interfaces');
var hostapd = require('./hostapd');
var dnsmasq = require('./dnsmasq');

let ifaceName = "wlan0";
let staticIP = "192.168.100.1"; 

interfaces.ifconfig(ifaceName, function(error, ifaces){
	if(error){
		console.log("Unable to get interfaces: " + error);
		return;
	}

	var iface = ifaces[ifaceName];
	if(iface){
		console.log("interface ip: " + iface['ip_addr']);
		console.log("interface running: " + iface['running']);
	} else {
		console.log("Interface not found...");
	}
});

/*** MAIN ***/
