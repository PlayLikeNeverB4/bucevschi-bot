'use strict';

const _ = require('lodash'),
      baseContestAPI = require('./base_contest_api');

class manualContestAPI extends baseContestAPI {
  static getContestMapping(contest) {
    return {
      id: contest.id,
      name: contest.name,
      startTimeMs: contest.startTimeSeconds * 1000,
      source: this.SOURCE_ID,
      sourceName: contest.sourceName,
      url: contest.url,
    };
  }

  static isResponseOK(response) {
    return _.isArray(response);
  }
}

manualContestAPI.API_URL = 'https://contest-parser.herokuapp.com/contests/other';
manualContestAPI.SOURCE_ID = 'OTHER';

module.exports = manualContestAPI;
