'use strict';

const dbUtils = require('../db_utils'),
      baseMessageHandler = require('./base_message_handler');

class unsubscribeHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    return receivedText === 'unsubscribe' ||
           receivedText === 'dezabonare';
  }

  static run(receivedText, psid) {
    return new Promise((resolve) => {
      dbUtils.unsubscribeUser(psid).then((result) => {
        let text;
        if (result === 'ok') {
          text = 'Ai fost sters din lista utilizatorilor abonati la mine! :(';
        } else if (result === 'not_found') {
          text = 'Nu esti abonat la mine... :-/';
        } else {
          text = 'A fost o eroare in timpul executarii acestei comenzi!';
        }
        this.resolveSimpleMessage(resolve, text);
      });
    });
  }
}

module.exports = unsubscribeHandler;
