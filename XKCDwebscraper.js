var request = require("request"),
	cheerio = require("cheerio"),
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
	}
	else{
		console.log("we got an error: " + error);
	}
});