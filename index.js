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
    },
    'GetRandomComic': function () {

    },
    'GetExplanation': function () {

    },
    'GetNextComic': function () {

    },
    'GetPreviousComic': function () {

    },
    'AMAZON.HelpIntent': function () {

    },
    'AMAZON.CancelIntent': function () {

    },
    'AMAZON.StopIntent': function () {

    }
};