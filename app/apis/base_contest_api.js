'use strict';

const request = require('request'),
      _ = require('lodash'),
      logger = require('winston');

class baseContestAPI {
  static fetchContests() {
    return new Promise((resolve, reject) => {
      try {
        request.get({
          "uri": this.getAPIUrl(),
        }, (error, result) => {
          if (!error) {
            const response = JSON.parse(result.body);
            if (this.isResponseOK(response)) {
              let contests = this.getContestsList(response).map((contest) => {
                return this.getContestMapping(contest);
              });
              contests = _.sortBy(contests, 'startTimeMs');
              resolve(contests);
            } else {
              logger.error(`[${ this.SOURCE_ID }] API call returned with error!`);
              resolve([]);
            }
          } else {
            logger.error(
              `[${ this.SOURCE_ID }] Unable to fetch contests: ${ error }`
            );
            resolve([]);
          }
        });
      } catch (err) {
        resolve([]);
      }
    });
  }

  static getAPIUrl() {
    return this.API_URL;
  }

  static isResponseOK(response) {
    return !_.isEmpty(response);
  }

  static getContestsList(response) {
    return response;
  }
}

module.exports = baseContestAPI;
