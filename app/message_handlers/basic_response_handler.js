'use strict';

const _ = require('lodash');
const baseMessageHandler = require('./base_message_handler');

class basicResponseHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    return _.some(this.getMatchingInputs(), (inputMessage) => {
      const index = receivedText.indexOf(inputMessage);
      return index !== -1;
    });
  }

  static run() {
    return new Promise((resolve) => {
      this.resolveSimpleMessage(
        resolve,
        this.getResponse()
      );
    });
  }

  static getMatchingInputs() {
    return [];
  }

  static getResponse() {
    return '';
  }
}

module.exports = basicResponseHandler;
