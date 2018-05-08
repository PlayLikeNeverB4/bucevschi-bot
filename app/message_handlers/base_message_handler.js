'use strict';

const logger = require('winston');

class baseMessageHandler {
  /*
   * receivedText: string with sender's text
   *
   * Checks if this handler can handle this message.
   */ 
  static meetsCondition(receivedText) {
    logger.error(`Not implemented meetsCondition: ${ receivedText }`);
    return false;
  }

  /*
   * receivedText: string with sender's text
   * psid: sender Messenger id
   *
   * Implements any effects that the message has and
   * returns the appropriate response.
   */
  static run(receivedText, psid) {
    throw new Error(`Not implemented! ${ receivedText } ${ psid }`);
  }

  static resolveSimpleMessage(resolve, text) {
    const response = {
      messageType: 'simple',
      message: text,
    };
    resolve(response);
  }
}

module.exports = baseMessageHandler;
