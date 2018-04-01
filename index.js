'use strict';

const express = require('express'),
      bodyParser = require('body-parser'),
      config = require('config'),
      app = express().use(bodyParser.json()),
      path = require('path');

const moment = require('moment'),
      logger = require("winston"),
      dbUtils = require('./app/db_utils'),
      bot = require('./app/bot'),
      contestsChecker = require('./app/contests_checker');

// Logging levels: error, warn, info, verbose, debug, silly
const LOGGER_LEVEL = process.env.LOGGER_LEVEL || config.get('loggerLevel');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  "timestamp": true,
  "level": LOGGER_LEVEL,
});

if (process.env.NODE_ENV === 'production') {
  logger.info('Setting up New Relic.');
  require('newrelic');
}

moment.tz.setDefault('UTC');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => logger.info('Webhook is listening...'));


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      const webhookEvent = entry.messaging[0];
      logger.info('Received webhook event!');
      logger.verbose(webhookEvent);

      // Get the sender PSID
      const senderPSID = webhookEvent.sender.id;

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        bot.handleMessage(senderPSID, webhookEvent.message);
      } else if (webhookEvent.postback) {
        bot.handlePostback(senderPSID, webhookEvent.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || config.get('validationToken');

  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      logger.info('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.get('/', (req, res) => {
  dbUtils.getSubscribers().then((subscribers) => {
    res.render('index', {
      subscribersCount: subscribers.length,
    });
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.engine('html', require('ejs').renderFile);


const CONTESTS_FETCH_INTERVAL = process.env.CONTESTS_FETCH_INTERVAL || config.get('contestsFetchInterval');

contestsChecker.checkContestReminders();
setInterval(() => {
  contestsChecker.checkContestReminders();
}, CONTESTS_FETCH_INTERVAL);
