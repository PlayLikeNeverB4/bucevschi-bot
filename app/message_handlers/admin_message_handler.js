'use strict';

const _ = require('lodash'),
      config = require('config'),
      dbUtils = require('../db_utils'),
      baseMessageHandler = require('./base_message_handler');

const ADMIN_MESSAGE_TOKEN = process.env.ADMIN_MESSAGE_TOKEN ||
                            config.get('adminMessageToken');

/*
 * Message format:
 * SYSMSG <ADMIN_MESSAGE_TOKEN> <MESSAGE>
 */
const parseAdminMessage = (receivedText) => {
  const tokens = receivedText.split(' ');
  if (tokens.length < 3) {
    return {
      error: 'Format gresit!',
    };
  }
  if (tokens[1] !== ADMIN_MESSAGE_TOKEN) {
    return {
      error: 'Token gresit!',
    };
  }
  const message = tokens.slice(2).join(' ');
  return {
    error: null,
    message,
  };
};

class adminMessageHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    return receivedText.startsWith('sysmsg');
  }

  static run(receivedText) {
    return new Promise((resolve) => {
      const result = parseAdminMessage(receivedText);
      if (result.error) {
        this.resolveSimpleMessage(resolve, result.error);
      } else {
        dbUtils.getSubscribers().then((subscribers) => {
          if (!_.isEmpty(subscribers)) {
            const adminMessage = `Am trimis mesajul asta ` + 
              `la ${ subscribers.length } utilizatori: ${ result.message }`;
            resolve({
              messageType: 'admin',
              adminMessage,
              message: result.message,
              subscribers,
            });
          } else {
            this.resolveSimpleMessage(
              resolve,
              'Nu am niciun utilizator abonat la care sa trimit acest mesaj :('
            );
          }
        });
      }
    });
  }
}

module.exports = adminMessageHandler;

