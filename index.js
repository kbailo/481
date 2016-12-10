'use strict';
var Alexa = require('alexa-sdk');
var cheerio = require("cheerio");
var request = require('request');
var mysql = require('mysql');

var SKILL_NAME = 'X K C D';

var userIdLocator = null;
var event_obj = null;

// ToDo: Find our app id (skill id?) and included it if needed
// var APP_ID = "";


// {current_index: x, current_prompt: y}

var conn = mysql.createPool({
  connectionLimit: 2,
  host      :  'xkcd-alexa-favorites.co3uedzbghxg.us-east-1.rds.amazonaws.com' ,  // RDS endpoint
  user      :  'mrjdunaj' ,  // MySQL username
  password  :  'xkcdonalexa' ,  // MySQL password
  database  :  'XKCD_favorites'
});

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    console.log('event', event);
    event_obj = event;
    userIdLocator = event.session.user.userId;
    console.log('context', context);
    // TODO: uncomment if needed
    // alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};



var num_comics = function() {
    var date1 = new Date();
    var date2 = new Date("11/19/2016");
    date1.setHours(date1.getHours() - 15);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var difWeeks = Math.floor(timeDiff / (1000 * 3600 * 168));
    var day = date1.getDay();
    console.log('time zone', date1);

    var num_new_comics = 1761 + (difWeeks * 3);
    if(day == 0){
        return num_new_comics;
    }
    else if(day < 3){
        return (num_new_comics + 1);
    }
    else if(day < 5){
        return (num_new_comics + 2);
    }
    else{
        return (num_new_comics + 3);
    }

};

var handlers = {
    'GetMostRecentComic': function () {
        var func_obj = this;
        // url of the most recent xkcd comic
        var url = 'http://www.explainxkcd.com/wiki/index.php/Main_Page';
        // Make a request in order to scrape the most recent comics transcript
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                var comic_num = 0;
                comic_num = $('#mw-content-text > center > p > a:nth-child(3) > b').text();
                comic_num++;
                // func_obj.attributes['current_index'] = comic_num;
                func_obj.attributes['current_data'] = {current_index: comic_num}
		transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();

                // Newlines cause Alexa to stop, make sure to romove them
                transcript = transcript.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                transcript = transcript.replace(/:/g, " says");
		transcript = transcript.replace("<-", "arrow pointing left");
		transcript = transcript.replace("->", "arrow pointing right");

                var reprompt = "What else can I do for you?";
                func_obj.attributes['current_data']['current_prompt'] = transcript;
                func_obj.attributes['max_id'] = comic_num;
                func_obj.emit(':ask', transcript, reprompt);
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetRandomComic': function () {
        var func_obj = this;
        var url = 'http://www.explainxkcd.com/wiki/index.php/Main_Page';
        // Make a request in order to scrape the most recent comics transcript
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                var comic_num = 0;
                comic_num = $('#mw-content-text > center > p > a:nth-child(3) > b').text();
                comic_num++;
                func_obj.attributes['max_id'] = comic_num;
                var random = Math.floor(Math.random() * func_obj.attributes['max_id']);
                func_obj.attributes['current_data'] = {current_index: random};
                // url of the most a random xkcd comic
                url = 'http://www.explainxkcd.com/wiki/index.php/' + random;
                // Make a request in order to scrape the most recent comics transcript
                request(url, function(error, response, body) {
                    if(!error){
                        var $ = cheerio.load(body);
                        var transcript = "";
                        transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();
                        // Newlines cause Alexa to stop, make sure to romove them
                        transcript = transcript.replace(/\n/g, " ");
                        // Making the diaglouge syntax of the transcript more natural for Alexa to read
                        transcript = transcript.replace(/:/g, " says");
			transcript = transcript.replace("<-", "arrow pointing left");
			transcript = transcript.replace("->", "arrow pointing right");
                        var reprompt = "What else can I do for you?"
                        func_obj.attributes['current_data']['current_prompt'] = transcript;
                        func_obj.emit(':ask', transcript, reprompt);
                    }
                    else{
                        func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                        func_obj.emit(':tell', "We're sorry, it looks like there was an error");
                    }
                })
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetSpecificComic': function() {
        var func_obj = this;
        console.log('event_obj', event_obj);
        console.log('request', event_obj.request);
        console.log('intent', event_obj.request.intent);
        console.log('slots', event_obj.request.intent.slots);
        console.log('comic_number', event_obj.request.intent.slots.comic_number);
        var comic_number = parseInt(event_obj.request.intent.slots.comic_number.value);
        if('max_id' in this.attributes){
            if(comic_number > this.attributes['max_id'] || comic_number < 1){
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks this comic doesn't exist. Please choose another comic.";
                func_obj.emit(':tell', "We're sorry, it looks this comic doesn't exist. Please choose another comic.");
                return;
            }
        }
        else if(comic_number > num_comics() || comic_number < 1){
            func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks this comic doesn't exist. Please choose another comic.";
            func_obj.emit(':tell', "We're sorry, it looks this comic doesn't exist. Please choose another comic.");
            return;
        }
        var url = 'http://www.explainxkcd.com/wiki/index.php/' + comic_number;
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();
                // Newlines cause Alexa to stop, make sure to romove them
                transcript = transcript.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                transcript = transcript.replace(/:/g, " says");
                // func_obj.attributes['current_index'] = comic_number;
		transcript = transcript.replace("<=", "arrow pointing left");
		transcript = transcript.replace("=>", "arrow pointing right");

                func_obj.attributes['current_data'] = {current_index: comic_number, current_prompt: transcript};

                var reprompt = "What else can I do for you?"
                func_obj.emit(':ask', transcript, reprompt);
            }
            else{
                func_obj.attributes['current_data'] = {current_prompt: transcript};
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetExplanation': function () {
        var func_obj = this;
        if (!('current_index' in this.attributes['current_data'])){
            var reprompt = "What can I help you with?";
            func_obj.attributes['current_data'] = {current_prompt: "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic."};
            this.emit(':ask', "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.", reprompt);
            return;
        }

        var url = 'http://www.explainxkcd.com/wiki/index.php/' + this.attributes['current_data']['current_index'];
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var explanation = "";
                explanation += $("h2:has(#Explanation)").nextUntil("h2:has(#Transcript)").not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"]').text().substring(0, 8000);
                // Newlines cause Alexa to stop, make sure to romove them
                explanation = explanation.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read

		explanation = explanation.replace("[edit]", "");
		// Doesn't allow for the "[edit]" parts of explanation to be read.
                func_obj.attributes['current_data']['current_prompt'] =  explanation;
                var reprompt = "What else can I do for you?"
                func_obj.emit(':ask', explanation, reprompt);
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] =  "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetComicNumber': function() {
	var func_obj = this;
        if (!('current_index' in this.attributes['current_data'])){
            var reprompt = "What can I help you with?";
            func_obj.attributes['current_data'] = {current_prompt: "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic."};
            this.emit(':ask', "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.", reprompt);
            return;
        }

        var url = 'http://www.explainxkcd.com/wiki/index.php/' + this.attributes['current_data']['current_index'];
	request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var comicNumber = "This is comic number";
                comicNumber += $('.firstHeading').children().text();
                // Newlines cause Alexa to stop, make sure to romove them
                comicNumber = comicNumber.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                comicNumber = comicNumber.replace(/:/g, ", titled");

                func_obj.attributes['current_data']['current_prompt'] = comicNumber;
                var reprompt = "What else can I do for you?"
                func_obj.emit(':ask', comicNumber, reprompt);
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetTitleText': function () {
        if (!('current_index' in this.attributes['current_data'])){
            var reprompt = "What can I help you with?";
            this.attributes['current_data']['current_prompt'] = "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.";
            this.emit(':ask', "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.", reprompt);
            return;
        }
        var func_obj = this;
        var url = 'http://www.explainxkcd.com/wiki/index.php/' + this.attributes['current_data']['current_index'];
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var title = "";
                title += $("span[style='color:grey']").parent().text().substring(12);
                // Newlines cause Alexa to stop, make sure to romove them
                title = title.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                func_obj.attributes['current_data']['current_prompt'] = title;
                var reprompt = "What else can I do for you?"
                func_obj.emit(':ask', title, reprompt);
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetNextComic': function () {

        if (!('current_index' in this.attributes['current_data'])){
            var reprompt = "What can I help you with?";
            this.attributes['current_data'] = {current_prompt: "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic."};
            this.emit(':ask', "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.", reprompt);
            return;
        }
        if('max_id' in this.attributes){
            if(this.attributes['current_data']['current_index'] >= this.attributes['max_id']){
                this.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there's no next comic.";
                this.emit(':ask', "We're sorry, it looks like there's no next comic.");
                return;
            }
        }
        else if(this.attributes['current_data']['current_index'] >= num_comics()){
            this.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there's no next comic.";
            this.emit(':ask', "We're sorry, it looks like there's no next comic.");
            return;
        }
        var next_index = this.attributes['current_data']['current_index'] + 1;
        var func_obj = this;

        var url = 'http://www.explainxkcd.com/wiki/index.php/' + next_index.toString();
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();
                // Newlines cause Alexa to stop, make sure to romove them
                transcript = transcript.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                transcript = transcript.replace(/:/g, " says");
		transcript = transcript.replace("<-", "arrow pointing left");
		transcript = transcript.replace("->", "arrow pointing right");
                func_obj.attributes['current_data']['current_index'] = next_index;
                func_obj.attributes['current_data']['current_prompt'] = transcript;
                var reprompt = "What else can I do for you?";
                func_obj.emit(':ask', transcript, reprompt);
            }
            else{
                func_obj.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there was an error";
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetPreviousComic': function () {
        if (!('current_index' in this.attributes['current_data'])){
            var reprompt = "What can I help you with?";
            this.attributes['current_data'] = {current_prompt: "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic."};
            this.emit(':ask', "We're sorry, it seems we're lost. Try asking for the most recent comic or a random comic.", reprompt);
            return;
        }
        if(this.attributes['current_data']['current_index'] == 1){
            this.attributes['current_data']['current_prompt'] = "We're sorry, it looks like there's no previous comic.";
            this.emit(':ask', "We're sorry, it looks like there's no previous comic.");
            return;
        }
        var previous_index = this.attributes['current_data']['current_index'] - 1;
        var func_obj = this;

        var url = 'http://www.explainxkcd.com/wiki/index.php/' + previous_index.toString();
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();

                // Newlines cause Alexa to stop, make sure to romove them
                transcript = transcript.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                transcript = transcript.replace(/:/g, " says");
		transcript = transcript.replace("<-", "arrow pointing left");
		transcript = transcript.replace("->", "arrow pointing right");
                func_obj.attributes['current_data']['current_index'] = previous_index;
                func_obj.attributes['current_data']['current_prompt'] = transcript;

                var reprompt = "What else can I do for you?"
                func_obj.emit(':ask', transcript, reprompt);
            }
            else{
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })

    },
    'GetBlackHat': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Black Hat is a stick figure character in xkcd. He is distinguished by his eponymous black hat. In his earliest appearances, Black Hat wore a taller top-hat style hat, that quickly evolved to have the current shape and style of a pork pie hat. Judging by 1139: Rubber and Glue, he has worn the hat since he was a child. That strip also gave him the nickname Hatboy. Black Hat seems to have short hair, as shown in Journal series, 412: Startled and 1401: New. He is revealed to be a blogger in the Secretary series, when Cory Doctorow referred to him as one of our own. Unlike many other characters in xkcd, he seems to represent the same character in every appearance.';
        this.emit(':ask', 'Black Hat is a stick figure character in xkcd. He is distinguished by his eponymous black hat. In his earliest appearances, Black Hat wore a taller top-hat style hat, that quickly evolved to have the current shape and style of a pork pie hat. Judging by 1139: Rubber and Glue, he has worn the hat since he was a child. That strip also gave him the nickname Hatboy. Black Hat seems to have short hair, as shown in Journal series, 412: Startled and 1401: New. He is revealed to be a blogger in the Secretary series, when Cory Doctorow referred to him as one of our own. Unlike many other characters in xkcd, he seems to represent the same character in every appearance.', reprompt);
    },
    'GetBeretGuy': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Beret Guy is an optimist, and sometimes a naive one (although he is rarely a victim in the strip). He is a funny and sometimes even borderline cute character, and when he is in the strip is usually the basis of that strips joke. He enjoys philosophizing, often taking the role of the existentialist. He has a very surreal side to him, often thinking about or being involved in bizarre situations. He also is shown to take things far too literally, sometimes making things surreal.';
        this.emit(':ask', 'Beret Guy is an optimist, and sometimes a naive one (although he is rarely a victim in the strip). He is a funny and sometimes even borderline cute character, and when he is in the strip is usually the basis of that strips joke. He enjoys philosophizing, often taking the role of the existentialist. He has a very surreal side to him, often thinking about or being involved in bizarre situations. He also is shown to take things far too literally, sometimes making things surreal.', reprompt);
    },
    'GetCueball': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Cueball is a stick figure character in xkcd, distinguished from other characters by having no distinguishing features (including no hair or hat). The name is unofficial, and pretty much only used on explain xkcd and TV Tropes. Like other xkcd characters, Cueball does not necessarily represent the same character from comic to comic, and is not necessarily a unique character in any given strip. Instead, he represents a generic everyman. In several comics, there are multiple such stick figures, any of whom could be called Cueball.';
        this.emit(':ask', 'Cueball is a stick figure character in xkcd, distinguished from other characters by having no distinguishing features (including no hair or hat). The name is unofficial, and pretty much only used on explain xkcd and TV Tropes. Like other xkcd characters, Cueball does not necessarily represent the same character from comic to comic, and is not necessarily a unique character in any given strip. Instead, he represents a generic everyman. In several comics, there are multiple such stick figures, any of whom could be called Cueball.', reprompt);
    },
    'GetHairy': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Hairy is a stick figure character in xkcd. The name is unofficial, used by xkcd explainers to describe male characters with hair and no other distinguishing features.';
        this.emit(':ask', 'Hairy is a stick figure character in xkcd. The name is unofficial, used by xkcd explainers to describe male characters with hair and no other distinguishing features.', reprompt);
    },
    'GetMegan': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Megan is a stick figure character in xkcd. She is the second-most frequently appearing character, after Cueball, and the most frequently appearing female character. She does not necessarily always represent the same character from comic to comic. She is essentially the female equivalent of Cueball, representing the every-woman to his everyman. This is less clear than for Cueball as there are several comics, where there are multiple Cueball-like figures, any of whom could be called Cueball.';
        this.emit(':ask', 'Megan is a stick figure character in xkcd. She is the second-most frequently appearing character, after Cueball, and the most frequently appearing female character. She does not necessarily always represent the same character from comic to comic. She is essentially the female equivalent of Cueball, representing the every-woman to his everyman. This is less clear than for Cueball as there are several comics, where there are multiple Cueball-like figures, any of whom could be called Cueball.', reprompt);
    },
    'GetPonytail': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'Ponytail is a stick figure character in xkcd, and the second most used female character, although she is far less used than Megan. She is distinguished from other characters by her blonde hair which is set up in a ponytail. Like Cueball and Megan, she does not necessarily represent the same character from comic to comic.';
        this.emit(':ask', 'Ponytail is a stick figure character in xkcd, and the second most used female character, although she is far less used than Megan. She is distinguished from other characters by her blonde hair which is set up in a ponytail. Like Cueball and Megan, she does not necessarily represent the same character from comic to comic.', reprompt);
    },
    'GetWhiteHat': function () {
        var reprompt = "What else can I do for you?"
        this.attributes['current_data']['current_prompt'] = 'White Hat is a stick figure character in xkcd. He is distinguished by his eponymous white hat which appears to be in the shape and style of a boater. His appearance is identical to that of Black Hat other than the color of their respective hats. Unlike Black Hat, however, does not necessarily represent the same character in each appearance.';
        this.emit(':ask', 'White Hat is a stick figure character in xkcd. He is distinguished by his eponymous white hat which appears to be in the shape and style of a boater. His appearance is identical to that of Black Hat other than the color of their respective hats. Unlike Black Hat, however, does not necessarily represent the same character in each appearance.', reprompt);
    },
    'RepeatPrompt': function () {
        var reprompt = "What else can I do for you?";
        var func_obj = this;
        this.emit(':ask', func_obj.attributes['current_data']['current_prompt'], reprompt);
    },
    'AMAZON.HelpIntent': function () {
        // ToDo: verify that we are passing the right paramaters to emit for this intent
        var speechOutput = "Welcome to x k c d. You can ask me for the most recent x k c d comic or a random x k c d comic at anytime. If you would like more information about a comic you just heard, you may ask for an explanation by saying explain. If you would like to hear the mouse over text associated with a comic you just heard, you may do so by saying mouse over text";
        var reprompt = "What can I help you with?";
        this.emit(':tell', speechOutput, reprompt);
    },
    'LaunchRequest': function(){
        var speechOutput = "Welcome to x k c d. You can ask me for the most recent x k c d comic or a random x k c d comic at anytime. If you would like more information about a comic you just heard, you may ask for an explanation by saying explain. If you would like to hear the mouse over text associated with a comic you just heard, you may do so by saying mouse over text";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
        return;
    },
    'AMAZON.CancelIntent': function () {
        // shouldEndSession = true;
        this.emit(':tell', 'Goodbye');
    },
    'AMAZON.StopIntent': function () {
        // shouldEndSession = true;
        this.emit(':tell', 'Ok');
    },
    'SaveMostRecent': function () {
      var func_obj = this;
      if (!('current_index' in this.attributes['current_data'])){
        var reprompt = "What can I help you with?";
        this.attributes['current_data'] = {current_prompt: 'Whoops, there was an error with current ID'};
        this.emit(':ask', 'Whops, there was an error with current ID', reprompt);
        return;
      }
      else {
        console.log('userId', userIdLocator);
        console.log('comicId', func_obj.attributes['current_data']['current_index']);
        conn.query('INSERT INTO favorites (alexaId, comicId) VALUES (\'' + userIdLocator + '\', ' + func_obj.attributes['current_data']['current_index'] + ');', function (err) {
          if(err){
            console.log('ERR:', err);
          }
        });
      }
      var reprompt = "What can I help you with?";
      this.attributes['current_data']['current_prompt'] = 'This comic has been saved';
      this.emit(':ask', 'This comic has been saved', reprompt);
    },
    'DeleteFavorite': function () {
      var func_obj = this;
      if (!('current_index' in this.attributes['current_data'])){
        var reprompt = "What can I help you with?";
        this.attributes['current_data'] = {current_prompt: 'Whoops, there was an error with current ID'};
        this.emit(':ask', 'Whops, there was an error with current ID', reprompt);
        return;
      }
      else {
        console.log('userId', userIdLocator);
        console.log('comicId', func_obj.attributes['current_data']['current_index']);
        conn.query('DELETE FROM favorites WHERE alexaId = \'' + userIdLocator + '\' AND comicId = ' + func_obj.attributes['current_data']['current_index'] + ');', function (err) {
          if(err){
            console.log('ERR:', err);
          }
        });
      }
      var reprompt = "What can I help you with?";
      this.attributes['current_data']['current_prompt'] = 'This comic has been removed.';
      this.emit(':ask', 'This comic has been removed.', reprompt);
    },
    'ReadFavoriteComic': function () {
      var func_obj = this;
      conn.query('SELECT comicId FROM favorites WHERE alexaId = \'' + userIdLocator + '\';', function(err, rows) {
        if(err) {
          console.log('ERR:', err);
          func_obj.emit(':tell', err);
        }
        console.log('rows', rows);
        if(rows.length === 0){
          console.log('no comics found');
          let complaint = 'You have no saved comics.';
          func_obj.attributes['current_data'] = {current_prompt: complaint};
          var reprompt = "What can I help you with?";
          func_obj.emit(':ask', complaint, reprompt);
        }
        else{
            var comicId = rows[Math.floor(Math.random()*rows.length)];
            var comicId = comicId.comicId;
            // var comicId = 0;

            var url = 'http://www.explainxkcd.com/wiki/index.php/' + comicId.toString();
            request(url, function(error, response, body) {
                if(!error){
                    var $ = cheerio.load(body);
                    var transcript = "";
                    transcript += $('h2:has(#Transcript)').nextUntil('h2:has([class]), h2:has([id]), [id]').not('table[style="background-color: white; border: 1px solid #aaa; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2); border-left: 10px solid #1E90FF; margin: 0 auto;"], .thumb.tright').text();
                    // Newlines cause Alexa to stop, make sure to romove them
                    transcript = transcript.replace(/\n/g, " ");
                    // Making the diaglouge syntax of the transcript more natural for Alexa to read
                    transcript = transcript.replace(/:/g, " says");
                		transcript = transcript.replace("<-", "arrow pointing left");
                		transcript = transcript.replace("->", "arrow pointing right");
                    func_obj.attributes['current_data']['current_index'] = comicId;
                    func_obj.attributes['current_data']['current_prompt'] = transcript;
                    var reprompt = "What can I help you with?";
                    func_obj.emit(':ask', transcript, reprompt);
                }
                else{
                    func_obj.emit(':tell', "We're sorry, it looks like there was an error");
                }
            });
        }
      });
    }
};
