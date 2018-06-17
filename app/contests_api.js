'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      config = require('config'),
      codeforcesAPI = require('./apis/codeforces_api'),
      atcoderAPI = require('./apis/atcoder_api'),
      csacademyAPI = require('./apis/csacademy_api'),
      manualContestAPI = require('./apis/manual_contest_api');

const MANUAL_API_ENABLED = process.env.MANUAL_API_ENABLED ||
                           config.get('manualApiEnabled');

const UPCOMING_DAYS_LIMIT = process.env.UPCOMING_DAYS_LIMIT ||
                            config.get('upcomingDaysLimit');

const apis = [
  codeforcesAPI,
  atcoderAPI,
  csacademyAPI,
];

if (MANUAL_API_ENABLED == "true") {
  apis.push(manualContestAPI);
}

const fetchContestsFromAllAPIs = () => {
  return new Promise((resolve) => {
    const apiPromises = apis.map((api) => api.fetchContests());
    Promise.all(apiPromises).then((results) => {
      let contests = _.flatten(results);
      contests = _.sortBy(contests, 'startTimeMs');
      resolve(contests);
    });
  });
};

const filterFutureContests = (contests) => {
  const now = moment.now();
  return _.filter(contests, (contest) => {
    return contest.startTimeMs &&
           contest.startTimeMs >= now &&
           moment(contest.startTimeMs).diff(now, 'days', true) <= UPCOMING_DAYS_LIMIT;
  });
};


const contestsAPI = {
  /*
   * Calls all contest APIs and select future contests.
   *
   * contest: {
   *   id: ...
   *   name: ...
   *   startTimeMs: ...
   *   source: ...
   * }
   */
  fetchFutureContests: () => {
    return new Promise((resolve) => {
      fetchContestsFromAllAPIs().then((contests) => {
        contests = filterFutureContests(contests);
        resolve(contests);
      });
    });
  },

  SOURCES_INFO: {},
};

const apisSourceInfo = apis.map((api) => {
  return {
    [ api.SOURCE_ID ]: {
      contestsURL: api.CONTESTS_URL,
      prettyName: api.PRETTY_NAME,
    },
  };
});

apisSourceInfo.forEach((apiSourceInfo) => {
  contestsAPI.SOURCES_INFO = _.assign(contestsAPI.SOURCES_INFO, apiSourceInfo);
});

module.exports = contestsAPI;
