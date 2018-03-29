'use strict';

const _ = require('lodash'),
      logger = require("winston"),
      moment = require('moment'),
      timezone = require('moment-timezone'),
      request = require('request'),
      config = require('config'),
      bot = require('./bot'),
      dbUtils = require('./db_utils');

const TWO_HOURS_IN_DAYS = 1.0 / 12;


// Calls API to get contests
const fetchContests = () => {
  return new Promise((resolve, reject) => {
    request({
      "uri": "http://codeforces.com/api/contest.list",
      "method": "GET"
    }, (error, result, body) => {
      if (!error) {
        const response = JSON.parse(result.body);
        if (response.status === 'OK') {
          const contests = response.result.map((contest) => {
            return _.pick(contest, [ 'id', 'name', 'startTimeSeconds' ]);
          });
          resolve(contests);
        } else {
          logger.error('API call returned with error!');
        }
      } else {
        logger.error("Unable to fetch contests: " + error);
      }
    }); 
  });
};

const filterFutureContests = (contests) => {
  const now = moment().unix();
  return _.filter(contests, (contest) => {
    return contest.startTimeSeconds && contest.startTimeSeconds >= now;
  });
};

// Checks which contests we didn't send reminders for
const getReminders = (contests) => {
  return new Promise((resolve, reject) => {
    const reminders = [];

    logger.verbose('Fetching previous reminders...');
    dbUtils.getReminders(contests).then((previousReminders) => {
      logger.debug(previousReminders);
      const reminderTimestampByContestId = _.keyBy(previousReminders, 'contest_id');
      logger.debug(reminderTimestampByContestId);

      const now = moment();
      contests.forEach((contest) => {
        const contestId = `CF${ contest.id }`;
        const reminder = reminderTimestampByContestId[contestId];

        let reminderDaysToContest;
        if (reminder) {
          reminderDaysToContest = moment(contest.startTimeSeconds * 1000).diff(moment(reminder.last_sent), 'days', true);
        } else {
          reminderDaysToContest = 1000;
        }
        const currentDaysToContest = moment(contest.startTimeSeconds * 1000).diff(now, 'days', true);

        if (reminderDaysToContest > TWO_HOURS_IN_DAYS && currentDaysToContest <= TWO_HOURS_IN_DAYS ||
            reminderDaysToContest > 1 && currentDaysToContest <= 1) {
          reminders.push({
            contestId: contestId,
            contestName: contest.name,
            contestStartTime: contest.startTimeSeconds,
          });
        }
      });

      resolve(reminders);
    });
  });
};


const contestsChecker = {
  checkContestReminders: () => {
    logger.info('Checking for contests...');
    fetchContests().then((contests) => {
      logger.verbose(`Got ${ contests.length } contests.`);
      contests = filterFutureContests(contests);
      logger.verbose(`Got ${ contests.length } future contests, checking dates...`);
      logger.debug(contests);
      getReminders(contests).then((reminders) => {
        logger.info(`Found ${ reminders.length } contests to send reminders for.`);
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
                })
              });
              logger.verbose('Finished sending reminders.');
            }
          });
          logger.verbose('Saving reminders...');
          dbUtils.saveReminders(reminders);
        }
      });
    });
  }
};

module.exports = contestsChecker;
