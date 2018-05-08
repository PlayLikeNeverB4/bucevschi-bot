'use strict';

const baseMessageHandler = require('./base_message_handler');

class unknownHandler extends baseMessageHandler {
  static meetsCondition() {
    return true;
  }

  static run(receivedText) {
    return new Promise((resolve) => {
      this.resolveSimpleMessage(
        resolve,
        `Nu stiu ce inseamna "${ receivedText }".`
      );
    });
  }
}

module.exports = unknownHandler;
