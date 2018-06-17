'use strict';

const basicResponseHandler = require('./basic_response_handler');

class greetingHandler extends basicResponseHandler {
  static getMatchingInputs() {
    return [
      'salut',
      'hello',
    ];
  }

  static getResponse() {
    return 'Salut! Eu sunt un bot care te anunta si iti aminteste ' +
           'despre concursuri. Daca te abonezi la mine vei primi ' +
           'notificari cu o zi si cu 2 ore inainte de concursuri. ' +
           'Foloseste optiunile din meniu.';
  }
}

module.exports = greetingHandler;
