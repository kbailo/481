'use strict';
var Alexa = require('alexa-sdk');

var SKILL_NAME = 'X K C D';


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
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