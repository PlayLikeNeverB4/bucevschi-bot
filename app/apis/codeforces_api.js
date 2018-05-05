'use strict';

const baseContestAPI = require('./base_contest_api');

class codeforcesAPI extends baseContestAPI {
  static isResponseOK(response) {
    return response.status === 'OK';
  }

  static getContestsList(response) {
    return response.result;
  }

  static getContestMapping(contest) {
    return {
      id: contest.id,
      name: contest.name,
      startTimeMs: contest.startTimeSeconds * 1000,
      source: this.SOURCE_ID,
    };
  }
};

codeforcesAPI.API_URL = 'http://codeforces.com/api/contest.list';
codeforcesAPI.SOURCE_ID = 'CF';
codeforcesAPI.CONTESTS_URL = 'http://codeforces.com/contests';
codeforcesAPI.PRETTY_NAME = 'Codeforces';

module.exports = codeforcesAPI;
