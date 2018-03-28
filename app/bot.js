'use strict';

const request = require('request'),
      config = require('config'),
      logger = require("winston"),
      botLogic = require('./bot_logic');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || config.get('pageAccessToken');


// Sends response messages via the Send API
const callSendAPI = (senderPSID, response) => {
  // Construct the message body
  const requestBody = {
    "recipient": {
      "id": senderPSID,
    },
    "message": response,
  };

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": requestBody
  }, (err, res, body) => {
    if (!err) {
      logger.verbose('Message sent!');
      logger.debug(requestBody);
    } else {
      logger.error('Unable to send message: ' + err);
    }
  });
};


// Handles API calls and data formatting
// Acts as the middle man between the application and the bot logic
const bot = {
  // Handles messages events
  handleMessage: (senderPSID, receivedMessage) => {
    // Check if the message contains text
    if (receivedMessage.text) {
      botLogic.getResponse(receivedMessage.text, senderPSID).then((responseText) => {
        const response = {
          "text": responseText,
        };
        callSendAPI(senderPSID, response);
      });
    } else {
      callSendAPI(senderPSID, null);
    }
  },

  // Handles messaging_postbacks events
  handlePostback: (senderPSID, receivedPostback) => {
    botLogic.getResponse(receivedPostback.payload, senderPSID).then((responseText) => {
      const response = {
        "text": responseText,
      };
      callSendAPI(senderPSID, response);
    });
  },

  sendMessage: (psid, text) => {
    const message = {
      "text": text,
    };
    callSendAPI(senderPSID, message);
  },

  sendContestReminder: (psid, reminder) => {
    const text = botLogic.getReminderText(reminder);
    const message = {
      "text": text,
    };
    callSendAPI(psid, message);
  },
};

module.exports = bot;
