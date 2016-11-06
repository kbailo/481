'use strict';
var Alexa = require('alexa-sdk');
var cheerio = require("cheerio");
var request = require('request');

var SKILL_NAME = 'X K C D';

// ToDo: Find our app id (skill id?) and included it if needed
// var APP_ID = "";


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    // TODO: uncomment if needed
    // alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'GetMostRecentComic': function () {
        // ToDo: change this to pull the most recent comic number
        this.attributes['current_index'] = 1755;

        var func_obj = this;
        // url of the most recent xkcd comic
        var url = 'http://www.explainxkcd.com/wiki/index.php/Main_Page';
        // Make a request in order to scrape the most recent comics transcript
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                transcript += $("h2:has(#Transcript)").nextUntil("span:has(#discussion)").not("table").text();
                var title = $("span[style='color:grey']").parent().text().substring(12);
                // Newlines cause Alexa to stop, make sure to romove them
                transcript = transcript.replace(/\n/g, " ");
                // Making the diaglouge syntax of the transcript more natural for Alexa to read
                transcript = transcript.replace(/:/g, " says");
                // ToDo: Should we send the title as well?
                func_obj.emit(':tell', transcript);
            }
            else{
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetRandomComic': function () {
        // ToDo: change this to pull the most recent comic number
        this.attributes['current_index'] = 159;

        this.emit(':tell', 'This is our random comic function');
    },
    'GetExplanation': function () {
        this.emit(':tell', 'This is our explanation function');
    },
    'GetNextComic': function () {
        // ToDo: Add error checking for indexing off list
        // ToDo: Add error checking for unset session variables
        var next_index = this.attributes['current_index'] + 1;

        // ToDo write code to scrape comic
        // ToDo upon success, update current_index variable
        this.emit(':tell', 'This is our next comic function');
    },
    'GetPreviousComic': function () {
        // ToDo: Add error checking for indexing off list
        // ToDo: Add error checking for unset session variables
        var previous_index = this.attributes['current_index'] - 1;

        // ToDo write code to scrape comic
        // ToDo upon success, update current_index variable
        this.emit(':tell', 'This is our previous comic function');
    },
    'AMAZON.HelpIntent': function () {
        // ToDo: verify that we are passing the right paramaters to emit for this intent
        var speechOutput = "This is our help intent";
        var reprompt = "What can I help you with?";
        this.emit(':tell', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Canceling, Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Stopping, Goodbye!');
    }
};
