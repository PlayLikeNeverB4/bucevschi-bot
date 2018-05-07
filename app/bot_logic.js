'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      dbUtils = require('./db_utils'),
      contestsAPI = require('./contests_api');


const isSubscribeMessage = (text) => {
  return text === 'subscribe' ||
         text === 'abonare';
};

const isUnsubscribeMessage = (text) => {
  return text === 'unsubscribe' ||
         text === 'dezabonare';
};

const isGreetingMessage = (text) => {
  return text.includes('salut');
};

const isNextMessage = (text) => {
  return text.includes('next') ||
         text.includes('urmatoare');
};


const buildTimeUntilContestString = (startTimeMs) => {
  return moment(startTimeMs).fromNow(true);
};

const buildFutureContestMessage = (contest) => {
  const timeString = buildTimeUntilContestString(contest.startTimeMs);
  const sourcePrettyName = contestsAPI.SOURCES_INFO[contest.source].prettyName;
  return `[peste ${ timeString }] [${ sourcePrettyName }] ${ contest.name }`;
};

const buildFutureContestsMessage = (contests) => {
  let text;
  if (!_.isEmpty(contests)) {
    text = 'Urmatoarele concursuri sunt:\n';

    contests.forEach((contest) => {
      text += buildFutureContestMessage(contest) + '\n';
    });

    _.forOwn(contestsAPI.SOURCES_INFO, (sourceInfo, sourceId) => {
      const anyContestWithSource = _.some(
                                    contests,
                                    (contest) => contest.source === sourceId
                                  );
      if (anyContestWithSource) {
        text += `${ sourceInfo.prettyName }: ${ sourceInfo.contestsURL }\n`;
      }
    });
  } else {
    text = 'Nu urmeaza niciun concurs in viitorul apropiat :O';
  }

  return text;
};


const botLogic = {
  /*
   * Returns the text that the bot should send back based on the received text.
   * Has side effects like adding user to the subscribers list.
   */
  getResponse: (receivedText, psid) => {
    receivedText = receivedText.toLowerCase();

    return new Promise((resolve) => {
      if (isSubscribeMessage(receivedText)) {
        dbUtils.subscribeUser(psid).then((result) => {
          if (result === 'ok') {
            resolve('Ai fost adaugat la lista utilizatorilor ' +
                    'abonati la mine! :D');
          } else if (result === 'duplicate') {
            resolve('Esti deja pe lista utilizatorilor abonati la mine! B-)');
          } else {
            resolve('A fost o eroare in timpul executarii acestei comenzi!');
          }
        });
      } else if (isUnsubscribeMessage(receivedText)) {
        dbUtils.unsubscribeUser(psid).then((result) => {
          if (result === 'ok') {
            resolve('Ai fost sters din lista utilizatorilor ' +
                    'abonati la mine! :(');
          } else if (result === 'not_found') {
            resolve('Nu esti abonat la mine... :-/');
          } else {
            resolve('A fost o eroare in timpul executarii acestei comenzi!');
          }
        });
      } else if (isGreetingMessage(receivedText)) {
        resolve('Salut! Eu sunt un bot care te anunta si iti aminteste ' +
                'despre concursuri. Daca te abonezi la mine vei primi ' +
                'notificari cu o zi si cu 2 ore inainte de concursuri. ' +
                'Foloseste optiunile din meniu.');
      } else if (isNextMessage(receivedText)) {
        contestsAPI.fetchFutureContests().then((contests) => {
          resolve(buildFutureContestsMessage(contests));
        });
      } else {
        resolve(`Nu stiu ce inseamna "${ receivedText }".`);
      }
    });
  },

  /* reminder: {
   *   contestStartTimeMs: ...
   *   contestName: ...
   *   contestId: ...
   *   contestSource: ...
   * }
   */
  getReminderText: (reminder) => {
    const timeString = buildTimeUntilContestString(reminder.contestStartTimeMs);
    const source = reminder.contestSource;
    const sourceInfo = contestsAPI.SOURCES_INFO[source];
    const sourceURL = reminder.contestURL || sourceInfo.contestsURL;
    const sourcePrettyName = sourceInfo.prettyName;

    return `Concursul ${ reminder.contestName } de pe ` +
           `${ sourcePrettyName } va avea loc in aproximativ ` +
           `${ timeString }. ${ sourceURL }`;
  },
};

module.exports = botLogic;
