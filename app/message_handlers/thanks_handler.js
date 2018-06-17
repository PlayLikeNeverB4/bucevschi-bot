'use strict';

const basicResponseHandler = require('./basic_response_handler');

class thanksHandler extends basicResponseHandler {
  static getMatchingInputs() {
    return [
      'mersi',
      'multumesc',
      'thanks',
      'thank you',
    ];
  }

  static getResponse() {
    return 'Cu placere!';
  }
}

module.exports = thanksHandler;
