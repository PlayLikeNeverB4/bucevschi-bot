'use strict';


const botLogic = {
  getResponse: (receivedText) => {
    if (receivedText === 'yes') {
      return "Thanks!";
    } else if (receivedText === 'no') {
      return "Oops, try sending another image.";
    } else {
      return `You sent the message: "${receivedText}". Now send me an image!`;
    }
  },
};

module.exports = botLogic;