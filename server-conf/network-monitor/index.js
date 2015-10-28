module.exports = {
	hostapd: require('./hostapd'),
	dnsmasq: require('./dnsmasq'),
	run: require('./monitor').runQuery
};
