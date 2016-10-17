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
	url = 'http://www.explainxkcd.com/wiki/index.php/Main_Page';
	request(url, function(error, response, body) {
		if(!error){
			var $ = cheerio.load(body);
			transcript = "";
			json = {title : "", transcript : ""};
			transcript += $("h2:has(#Transcript)").nextUntil("span:has(#discussion)").text();
			/*$("dd").each(function(){
				transcript += $(this).text();
			});*/
		//	console.log(transcript);
			title = $("span[style='color:grey']").parent().text().substring(12);
		//	console.log(title);
			json.title = title;
		//	explanation = "";
		//   	explanation += $("h2:has(#Explanation)").nextUntil("h2:has(#Transcript)").not("table").text();
		//	explanation = explanation.replace(/\n/g, " ");
		//	json.explanation = explanation;
			transcript = transcript.replace(/\n/g, " ");
			transcript = transcript.replace(/:/g, " says");
			json.transcript = transcript;
			res.status(200).json(json)
		}
		else{
			console.log("we got an error: " + error);
		}
	});
});
