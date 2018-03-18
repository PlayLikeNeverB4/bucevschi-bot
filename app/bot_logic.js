'use strict';

const dbUtils = require('./db_utils');

const isSubscribeMessage = (text) => {
  return text === 'subscribe' ||
         text === 'abonare';
};

const isUnsubscribeMessage = (text) => {
  return text === 'unsubscribe' ||
         text === 'dezabonare';
};

const isGreetingMessage = (text) => {
  return text === 'salut';
};

const botLogic = {
  getResponse: (receivedText, psid) => {
    receivedText = receivedText.toLowerCase();

    return new Promise((resolve, reject) => {
      if (isSubscribeMessage(receivedText)) {
        dbUtils.subscribeUser(psid).then((result) => {
          if (result === 'ok') {
            resolve('Ai fost adaugat la lista utilizatorilor abonati la mine! :D');
          } else if (result === 'duplicate') {
            resolve('Esti deja pe lista utilizatorilor abonati la mine! B-)');
          } else {
            resolve('A fost o eroare in timpul executarii acestei comenzi!');
          }
        });
      } else if (isUnsubscribeMessage(receivedText)) {
        dbUtils.unsubscribeUser(psid).then((result) => {
          if (result === 'ok') {
            resolve("Ai fost sters din lista utilizatorilor abonati la mine! :(");
          } else if (result === 'not_found') {
            resolve("Nu esti abonat la mine... :-/");
          } else {
            resolve("A fost o eroare in timpul executarii acestei comenzi!");
          }
        });
      } else if (isGreetingMessage(receivedText)) {
        resolve("Salut! Eu sunt un bot care te anunta si iti aminteste despre concursuri.");
      } else {
        resolve(`Nu stiu ce inseamna "${ receivedText }".`);
      }
    });
  },
};

module.exports = botLogic;
