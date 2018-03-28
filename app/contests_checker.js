'use strict';

const _ = require('lodash'),
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
          console.error("API call returned with error!");
        }
      } else {
        console.error("Unable to fetch contests: " + error);
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

    console.log("Fetching previous reminders...");
    dbUtils.getReminders(contests).then((previousReminders) => {
      console.log(previousReminders);
      const reminderTimestampByContestId = _.keyBy(previousReminders, 'contest_id');
      console.log(reminderTimestampByContestId);

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

        if (reminderDaysToContest > TWO_HOURS_IN_DAYS && currentDaysToContest <= TWO_HOURS_IN_DAYS) {
          reminders.push({
            type: 'hours',
            contestId: contestId,
            contestName: contest.name,
          });
        } else if (reminderDaysToContest > 1 && currentDaysToContest <= 1) {
          reminders.push({
            type: 'day',
            contestId: contestId,
            contestName: contest.name,
          });
        }
      });

      resolve(reminders);
    });
  });
};


const contestsChecker = {
  checkContestReminders: () => {
    console.log("Checking for contests (API calls)...");
    fetchContests().then((contests) => {
      console.log(`Got ${ contests.length } contests.`);
      contests = filterFutureContests(contests);
      console.log(`Got ${ contests.length } future contests, checking dates...`);
      // console.log(contests);
      getReminders(contests).then((reminders) => {
        console.log(`Found ${ reminders.length } contests to send reminders for.`);
        console.log(reminders);
        if (reminders.length > 0) {
          console.log("Fetching subscribers...");
          dbUtils.getSubscribers().then((subscribers) => {
            console.log(`Found ${ subscribers.length } subscribers.`);
            if (subscribers.length > 0) {
              console.log(subscribers);
              console.log("Sending reminders...");
              reminders.forEach((reminder) => {
                subscribers.forEach((subscriber) => {
                  bot.sendContestReminder(subscriber.psid, reminder);
                })
              });
              console.log("Finished sending reminders.");
            }
          });
          console.log("Saving reminders...");
          dbUtils.saveReminders(reminders);
        }
      });
    });
  }
};

module.exports = contestsChecker;
