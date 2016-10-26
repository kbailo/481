# XKCD on Alexa
### Capstone Project for University of Michigan EECS 481
### Fall 2016
### Michal Brna (mbrnak), Matthew Dunaj (mdunaj), Brian Kurilko (kurilkob), Kara Puidokas (kbailo)

## Notes
Most of the Alpha stage of this project was done as a group on a single persons computers. Therefore the uneven distribuation of commits is not neccesarily reflective of the distribution of work.

## Stack Used
This project is implemented by registering an Alexa Skill with Amazon. Our skill (X K C D) communicates with an AWS Lambda which runs various code based on the type of request by the user. The Lambda runs using Node.JS and utilizes these NPM libraries...
  * alexa-sdk
  * cheerio
  * request

## How to Update
#### Both the Alexa Skill and AWS Lambda are under our group account however they are accessed differently.
To access the Skill visit: https://developer.amazon.com (login with group account) -> Alexa -> Alexa Skills Kit
To access the Lambda visit: https://aws.amazon.com/ (login with group account) -> Lambda
To access the logs of our Lambda visit: https://aws.amazon.com/ (login with group account) -> CloudWatch -> Logs

#### If you wish to update the Lambda code...
You must upload an updated zip file containing index.js and the node_modules folder. Once uploaded, select save and test to verify that nothing broke.

## Project Stages
### Alpha
  * All intents and utterances have been defined
  * Alexa Skill and AWS Lambda have been created with all group members able to access them
  * Most Recent Comic intent is fully functional
  * All other intents return unique text to show they are connected

### Beta
 * Previous / Next / Sessions - Matt
 * Explanation - Brian
 * Random - Kara
 * Title Text - Brian
 * Specific Comic - Brian
 * Saving Favorites - Michal
 * Weed out / warn/prompt of long/incomplete transcripts - Matt
 * Help Intent -  Kara
 * Who are the Characters intent - Kara
 * Intro to XKCD intent - Kara
 * Publish to Amazon App Store - Kara