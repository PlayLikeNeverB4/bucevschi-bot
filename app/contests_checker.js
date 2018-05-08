'use strict';

const _ = require('lodash'),
      logger = require("winston"),
      moment = require('moment'),
      bot = require('./bot'),
      dbUtils = require('./db_utils'),
      contestsAPI = require('./contests_api');

const TWO_HOURS_IN_DAYS = 1.0 / 12;


/*
 * Checks which contests we need to send reminders for.
 */
const getReminders = (contests) => {
  return new Promise((resolve) => {
    const reminders = [];

    logger.verbose('Fetching previous reminders...');
    dbUtils.getReminders().then((previousReminders) => {
      logger.debug(previousReminders);
      const reminderTimestampByContestId = _.keyBy(previousReminders,
                                                   'contest_id');
      logger.debug(reminderTimestampByContestId);

      const now = moment();
      contests.forEach((contest) => {
        const contestId = `${ contest.source }${ contest.id }`;
        const reminder = reminderTimestampByContestId[contestId];

        let reminderDaysToContest;
        if (reminder) {
          const lastMoment = moment(reminder.last_sent);
          reminderDaysToContest = moment(contest.startTimeMs).diff(lastMoment,
                                                                   'days',
                                                                   true);
        } else {
          reminderDaysToContest = 1000;
        }
        const currentDaysToContest = moment(contest.startTimeMs).diff(now,
                                                                      'days',
                                                                      true);

        if ((reminderDaysToContest > TWO_HOURS_IN_DAYS &&
             currentDaysToContest <= TWO_HOURS_IN_DAYS) ||
            (reminderDaysToContest > 1 &&
             currentDaysToContest <= 1)) {
          reminders.push({
            contestId: contestId,
            contestName: contest.name,
            contestStartTimeMs: contest.startTimeMs,
            contestSource: contest.source,
            contestURL: contest.url,
          });
        }
      });

      resolve(reminders);
    });
  });
};


const contestsChecker = {
  /*
   * Checks if we need to send reminders and sends them.
   */
  checkContestReminders: () => {
    logger.info('Checking for contests...');
    contestsAPI.fetchFutureContests().then((contests) => {
      logger.verbose(`Got ${ contests.length } future contests.`);
      logger.debug(contests);
      getReminders(contests).then((reminders) => {
        logger.info(`Generated ${ reminders.length } reminders.`);
        logger.verbose(reminders);
        if (reminders.length > 0) {
          logger.verbose('Fetching subscribers...');
          dbUtils.getSubscribers().then((subscribers) => {
            logger.verbose(`Found ${ subscribers.length } subscribers.`);
            logger.debug(subscribers);
            if (subscribers.length > 0) {
              logger.verbose('Sending reminders...');
              reminders.forEach((reminder) => {
                subscribers.forEach((subscriber) => {
                  bot.sendContestReminder(subscriber.psid, reminder);
                });
                // TODO: un-comment the next line after figuring out how to get
                // a permanent page post access token
                // bot.postPageContestReminder(reminder);
              });
              logger.verbose('Finished sending reminders.');
            }
          });
          logger.verbose('Saving reminders...');
          dbUtils.saveReminders(reminders);
        }
      });
      dbUtils.removeOldReminders();
    });
  },
};

module.exports = contestsChecker;
