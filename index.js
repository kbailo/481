'use strict';
var Alexa = require('alexa-sdk');

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
        this.emit(':tell', 'This is our most recent comic function');
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