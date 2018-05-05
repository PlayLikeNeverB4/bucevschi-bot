'use strict';

const baseContestAPI = require('./base_contest_api');

class atcoderAPI extends baseContestAPI {
  static getContestMapping(contest) {
    return {
      id: contest.id,
      name: contest.name,
      startTimeMs: contest.startTimeSeconds * 1000,
      source: this.SOURCE_ID,
      url: contest.url,
    };
  }
};

atcoderAPI.API_URL = 'https://contest-parser.herokuapp.com/contests/atcoder';
atcoderAPI.SOURCE_ID = 'ATCODER';
atcoderAPI.CONTESTS_URL = 'https://atcoder.jp/contest';
atcoderAPI.PRETTY_NAME = 'AtCoder';

module.exports = atcoderAPI;
