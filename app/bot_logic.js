'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      contestsAPI = require('./contests_api'),
      greetingHandler = require('./message_handlers/greeting_handler'),
      subscribeHandler = require('./message_handlers/subscribe_handler'),
      unsubscribeHandler = require('./message_handlers/unsubscribe_handler'),
      upcomingHandler = require('./message_handlers/upcoming_handler'),
      adminMessageHandler = require('./message_handlers/admin_message_handler'),
      unknownHandler = require('./message_handlers/unknown_handler'),
      thanksHandler = require('./message_handlers/thanks_handler');

const messageHandlers = [
  adminMessageHandler,
  upcomingHandler,
  subscribeHandler,
  unsubscribeHandler,
  greetingHandler,
  thanksHandler,
  unknownHandler,
];

const botLogic = {
  /*
   * Returns the text that the bot should send back based on the received text.
   * Has side effects like adding user to the subscribers list.
   */
  getResponse: (receivedText, psid) => {
    return new Promise((resolve) => {
      const handler = _.find(
        messageHandlers,
        (handler) => handler.meetsCondition(receivedText)
      );
      handler.run(receivedText, psid).then((response) => {
        resolve(response);
      });
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
    const timeString = moment(reminder.contestStartTimeMs).fromNow(true);
    const source = reminder.contestSource;
    const sourceInfo = contestsAPI.SOURCES_INFO[source];
    const sourceURL = reminder.contestURL || sourceInfo.contestsURL;

    let sourceText = '';
    if (sourceInfo && sourceInfo.prettyName) {
      const sourcePrettyName = sourceInfo.prettyName;
      sourceText = `de pe ${ sourcePrettyName } `;
    } else if (reminder.contestSourceName) {
      const sourcePrettyName = reminder.contestSourceName;
      sourceText = `de pe ${ sourcePrettyName } `;
    }

    return `Concursul ${ reminder.contestName } ${ sourceText }va avea loc ` +
           `in aproximativ ${ timeString }. ${ sourceURL }`;
  },
};

module.exports = botLogic;
