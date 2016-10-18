'use strict';
var Alexa = require('alexa-sdk');
var cheerio = require("cheerio");
var request = require('request');
var async = require('async');

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
        var func_obj = this;
        var url = 'http://www.explainxkcd.com/wiki/index.php/Main_Page';
        request(url, function(error, response, body) {
            if(!error){
                var $ = cheerio.load(body);
                var transcript = "";
                var json = {title : "", transcript : ""};
                transcript += $("h2:has(#Transcript)").nextUntil("span:has(#discussion)").text();
                var title = $("span[style='color:grey']").parent().text().substring(12);
                transcript = transcript.replace(/\n/g, " ");
                transcript = transcript.replace(/:/g, " says");
                func_obj.emit(':tell', transcript);
            }
            else{
                func_obj.emit(':tell', "We're sorry, it looks like there was an error");
            }
        })
    },
    'GetRandomComic': function () {
        this.emit(':tell', 'This is our random comic function');
    },
    'GetExplanation': function () {
        this.emit(':tell', 'This is our explanation function');
    },
    'GetNextComic': function () {
        this.emit(':tell', 'This is our next comic function');
    },
    'GetPreviousComic': function () {
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