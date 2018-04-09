'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      dbUtils = require('./db_utils'),
      codeforcesAPI = require('./codeforces_api');


const CONTESTS_URL = 'http://codeforces.com/contests';

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

const isNextMessage = (text) => {
  return text == 'next' ||
         text == 'urmatoarele';
};


const buildTimeUntilContestString = (startTimeSeconds) => {
  return moment(startTimeSeconds * 1000).fromNow(true);
};

const buildFutureContestMessage = (contest) => {
  const timeString = buildTimeUntilContestString(contest.startTimeSeconds);
  return `${ contest.name } (peste aproximativ ${ timeString })`;
};

const buildFutureContestsMessage = (contests) => {
  let text = 'Urmatoarele concursuri de pe Codeforces sunt:\n';

  contests.forEach((contest) => {
    text += buildFutureContestMessage(contest) + '\n';
  });

  text += `URL: ${ CONTESTS_URL }`;

  return text;
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
      } else if (isNextMessage(receivedText)) {
        codeforcesAPI.fetchFutureContests().then((contests) => {
          resolve(buildFutureContestsMessage(contests));
        });
      } else {
        resolve(`Nu stiu ce inseamna "${ receivedText }".`);
      }
    });
  },

  /* reminder = {
   *   ...
   * }
   */
  getReminderText: (reminder) => {
    const timeString = buildTimeUntilContestString(reminder.contestStartTime);

    return `Concursul ${ reminder.contestName } de pe Codeforces va avea loc in aproximativ ${ timeString }. ${ CONTESTS_URL }`;
  },
};

module.exports = botLogic;
