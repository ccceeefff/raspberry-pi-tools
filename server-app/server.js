var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./routes/settings');
var sensors = require('./routes/sensors');
var wifi = require('./routes/wifi');
var networkMonitor = require('./network-monitor');

var Uploader = require('./controllers').Uploader;

var radio = require('./radio');
var app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.set('host', process.env.HOST || '0.0.0.0');
app.set('port', process.env.PORT || 3000);

var apiBase = '/api/v1/';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use(apiBase + 'settings', settings);
app.use(apiBase + 'sensors', sensors);
app.use(apiBase + 'wifi', wifi);

routes.post('/api/v1/submit', function(req, res){
	console.log("submission: " + JSON.stringify(req.body));
	res.sendStatus(200);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;

  networkMonitor.interfaces.ifconfig('wlan0', function(error, ifaces){
    var wlan0 = ifaces['wlan0'];
    console.log('mac_addr: ' + wlan0.mac_addr);
    var uploader = new Uploader(wlan0.mac_addr);
    setInterval(function() {
      uploader.run();
    }, 60000)
  });
  
  console.log('Server is running at http://' + host + ':' + port);
})

// run on startup
wifi.checkWiFiState();
setInterval(function(){
  wifi.checkWiFiState();
}, 1000 * 60 * 5); // every 5 minutes
