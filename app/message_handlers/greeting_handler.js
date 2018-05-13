'use strict';

const baseMessageHandler = require('./base_message_handler');

class greetingHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    const index = receivedText.indexOf('salut');
    return index !== -1 && index < 10;
  }

  static run() {
    return new Promise((resolve) => {
      this.resolveSimpleMessage(
        resolve,
        'Salut! Eu sunt un bot care te anunta si iti aminteste ' +
        'despre concursuri. Daca te abonezi la mine vei primi ' +
        'notificari cu o zi si cu 2 ore inainte de concursuri. ' +
        'Foloseste optiunile din meniu.'
      );
    });
  }
}

module.exports = greetingHandler;
