'use strict';

const moment = require('moment-timezone'),
      config = require('config'),
      baseContestAPI = require('./base_contest_api');

const CLIST_API_KEY = process.env.CLIST_API_KEY || config.get('clistAPIKey');
const CLIST_API_USER = process.env.CLIST_API_USER || config.get('clistAPIUser');

class atcoderAPI extends baseContestAPI {
  static getAPIUrl() {
    return this.API_URL +
           `&username=${ CLIST_API_USER }` +
           `&api_key=${ CLIST_API_KEY }` +
           `&start__gt=${ moment().format('YYYY-MM-DD') }`;
  }

  static getContestMapping(contest) {
    const startTimeSeconds = moment.tz(contest.start, 'UTC').unix();
    return {
      id: contest.id,
      name: contest.event,
      startTimeMs: startTimeSeconds * 1000,
      source: this.SOURCE_ID,
      url: contest.href,
    };
  }

  static isResponseOK(response) {
    return !!response.meta;
  }

  static getContestsList(response) {
    return response.objects;
  }
}

atcoderAPI.API_URL = 'https://clist.by/api/v1/json/contest/?resource__id=93';
atcoderAPI.SOURCE_ID = 'ATCODER';
atcoderAPI.CONTESTS_URL = 'https://atcoder.jp/contest';
atcoderAPI.PRETTY_NAME = 'AtCoder';

module.exports = atcoderAPI;
