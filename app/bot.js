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
    recipient: {
      id: senderPSID,
    },
    message: {
      text: response,
    },
    tag: "CONFIRMED_EVENT_UPDATE",
  };

  // Send the HTTP request to the Messenger Platform
  request({
    uri: "https://graph.facebook.com/v7.0/me/messages",
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: "POST",
    json: requestBody,
  }, (err, res, body) => {
    if (!err && !(body && body.error && body.error.message)) {
      logger.info(`Message sent to ${ senderPSID }!`);
      logger.debug(requestBody);
    } else {
      let err2 = '';
      if (body && body.error && body.error.message) {
        err2 = body.error.message;
      }
      logger.error(`Unable to send message:\n${ err }\n${ err2 }\nUser ID: ${ senderPSID }`);
    }
  });
};

/*
 * Post on the Page via the Graph API.
 */
const callPagePostAPI = (text) => {
  request({
    uri: `https://graph.facebook.com/${ PAGE_ID }/feed`,
    qs: {
      message: text,
      access_token: PAGE_POST_ACCESS_TOKEN,
    },
    method: "POST",
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

const handleMessage = (senderPSID, receivedMessage) => {
  if (receivedMessage) {
    botLogic.getResponse(receivedMessage, senderPSID)
      .then((response) => {
        if (response.messageType === 'simple') {
          callSendAPI(senderPSID, response.message);
        } else if (response.messageType === 'admin') {
          callSendAPI(senderPSID, response.adminMessage);
          response.subscribers.forEach((subscriber) => {
            callSendAPI(subscriber.psid, response.message);
          });
        }
    });
  }
};


// Handles API calls and data formatting
// Acts as the middle man between the application and the bot logic
const bot = {
  /*
   * Handles messages events.
   */
  handleMessage: (senderPSID, receivedMessage) => {
    handleMessage(senderPSID, receivedMessage.text);
  },

  /*
   * Handles messaging_postbacks events.
   */
  handlePostback: (senderPSID, receivedPostback) => {
    handleMessage(senderPSID, receivedPostback.payload);
  },

  /*
   * psid: Subscriber ID
   * text: message string
   *
   * Sends message to user.
   */
  sendMessage: (psid, text) => {
    callSendAPI(psid, text);
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
    callSendAPI(psid, text);
  },

  /*
   * reminder: {
   *   contestStartTime: ...
   *   contestName: ...
   *   contestId: ...
   * }
   *
   * Sends contest reminder to the bot page.
   */
  postPageContestReminder: (reminder) => {
    const text = botLogic.getReminderText(reminder);
    callPagePostAPI(text);
  },
};

module.exports = bot;
