var express    = require("express");
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

// set up routes
app.get("/api/enable_wifi", function(request, response){
	console.log("incoming request..");
	response.end("world");
});

// Listen on our server
 app.listen(8080);
 console.log("server running...");