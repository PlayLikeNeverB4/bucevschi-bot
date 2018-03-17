'use strict';

const request = require('request'),
      config = require('config'),
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
      console.log('Message sent!');
      console.log(requestBody);
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
};


const bot = {
  // Handles messages events
  handleMessage: (senderPSID, receivedMessage) => {
    let response;

    // Check if the message contains text
    if (receivedMessage.text) {
      const responseText = botLogic.getResponse(receivedMessage.text);
      response = {
        "text": responseText,
      };
    }

    callSendAPI(senderPSID, response);
  },

  // Handles messaging_postbacks events
  handlePostback: (senderPSID, receivedPostback) => {
    const payload = receivedPostback.payload;
    const responseText = botLogic.getResponse(payload);
    const response = {
      "text": responseText,
    };

    callSendAPI(senderPSID, response);
  },
};

module.exports = bot;
