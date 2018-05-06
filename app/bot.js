'use strict';

const request = require('request'),
      config = require('config'),
      logger = require("winston"),
      botLogic = require('./bot_logic');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN ||
                          config.get('pageAccessToken');
const PAGE_POST_ACCESS_TOKEN = process.env.PAGE_POST_ACCESS_TOKEN ||
                               config.get('pagePostAccessToken');
const PAGE_ID = process.env.PAGE_ID || config.get('pageId');

/*
 * Sends message via the Send API.
 */
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
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN,
    },
    "method": "POST",
    "json": requestBody,
  }, (err) => {
    if (!err) {
      logger.verbose('Message sent!');
      logger.debug(requestBody);
    } else {
      logger.error('Unable to send message: ' + err);
    }
  });
};

/*
 * Post on the Page via the Graph API.
 */
const callPagePostAPI = (text) => {
  request({
    "uri": `https://graph.facebook.com/${ PAGE_ID }/feed`,
    "qs": {
      "message": text,
      "access_token": PAGE_POST_ACCESS_TOKEN,
    },
    "method": "POST",
  }, (err, res, body) => {
    if (!err) {
      logger.debug(body);
      const bodyObj = JSON.parse(body);
      if (bodyObj["error"] && bodyObj["error"]["error_user_msg"]) {
        logger.error(bodyObj["error"]["error_user_msg"]);
      }
    } else {
      logger.error('Unable to post to page: ' + err);
    }
  });
};


// Handles API calls and data formatting
// Acts as the middle man between the application and the bot logic
const bot = {
  /*
   * Handles messages events.
   */
  handleMessage: (senderPSID, receivedMessage) => {
    // Check if the message contains text
    if (receivedMessage.text) {
      botLogic.getResponse(receivedMessage.text, senderPSID)
        .then((responseText) => {
          const response = {
            "text": responseText,
          };
          callSendAPI(senderPSID, response);
        });
    } else {
      callSendAPI(senderPSID, null);
    }
  },

  /*
   * Handles messaging_postbacks events.
   */
  handlePostback: (senderPSID, receivedPostback) => {
    botLogic.getResponse(receivedPostback.payload, senderPSID)
      .then((responseText) => {
        const response = {
          "text": responseText,
        };
        callSendAPI(senderPSID, response);
      });
  },

  /*
   * psid: Subscriber ID
   * text: message string
   *
   * Sends message to user.
   */
  sendMessage: (psid, text) => {
    const message = {
      "text": text,
    };
    callSendAPI(psid, message);
  },

  /*
   * psid: Subscriber ID
   * reminder: {
   *   contestStartTime: ...
   *   contestName: ...
   *   contestId: ...
   * }
   *
   * Sends contest reminder to user.
   */
  sendContestReminder: (psid, reminder) => {
    const text = botLogic.getReminderText(reminder);
    const message = {
      "text": text,
    };
    callSendAPI(psid, message);
  },

  /*
   * reminder: {
   *   contestStartTime: ...
   *   contestName: ...
   *   contestId: ...
   * }
   *
   * Sends contest reminder to user.
   */
  postPageContestReminder: (reminder) => {
    const text = botLogic.getReminderText(reminder);
    callPagePostAPI(text);
  },
};

module.exports = bot;
