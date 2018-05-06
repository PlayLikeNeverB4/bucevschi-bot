'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      codeforcesAPI = require('./apis/codeforces_api'),
      atcoderAPI = require('./apis/atcoder_api'),
      csacademyAPI = require('./apis/csacademy_api');

const apis = [ codeforcesAPI, atcoderAPI, csacademyAPI ];

const fetchContestsFromAllAPIs = () => {
  return new Promise((resolve, reject) => {
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
           moment(contest.startTimeMs).diff(now, 'months', true) <= 1;
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
    return new Promise((resolve, reject) => {
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
    }
  }
});

apisSourceInfo.forEach((apiSourceInfo) => {
  contestsAPI.SOURCES_INFO = _.assign(contestsAPI.SOURCES_INFO, apiSourceInfo);
});

module.exports = contestsAPI;