var express = require("express");
var path = require("path");
var request = require('request');
var app = express();
app.use(express.static(__dirname + "/public"));

var request = require("request");
var	cheerio = require("cheerio");



var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});




app.get("/latest", function(req, res) {
	url = 'http://www.explainxkcd.com/wiki/index.php/1744';
	request(url, function(error, response, body) {
		if(!error){
			var $ = cheerio.load(body);
			transcript = "";
			json = {title : "", transcript : ""}
			$("dd").not("div[style='border:1px solid grey; background:#eee; padding:1em;'] dl dd").each(function(){
				transcript += $(this).text();
			})
		//	console.log(transcript);
			title = $("span[style='color:grey']").parent().text().substring(12);
		//	console.log(title);
			json.title = title;
			json.transcript = transcript;
			res.status(200).json(json);
		}
		else{
			console.log("we got an error: " + error);
		}
	});
});
