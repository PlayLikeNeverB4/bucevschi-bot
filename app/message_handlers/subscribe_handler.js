'use strict';

const dbUtils = require('../db_utils'),
      baseMessageHandler = require('./base_message_handler');

class subscribeHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    return receivedText === 'subscribe' ||
           receivedText === 'abonare';
  }

  static run(receivedText, psid) {
    return new Promise((resolve) => {
      dbUtils.subscribeUser(psid).then((result) => {
        let text;
        if (result === 'ok') {
          text = 'Ai fost adaugat la lista utilizatorilor abonati la mine! :D';
        } else if (result === 'duplicate') {
          text = 'Esti deja pe lista utilizatorilor abonati la mine! B-)';
        } else {
          text = 'A fost o eroare in timpul executarii acestei comenzi!';
        }
        this.resolveSimpleMessage(resolve, text);
      });
    });
  }
}

module.exports = subscribeHandler;
