'use strict';

const request = require('request'),
      _ = require('lodash');

class baseContestAPI {
  static fetchContests() {
    return new Promise((resolve, reject) => {
      request({
        "uri": this.API_URL,
        "method": "GET"
      }, (error, result, body) => {
        if (!error) {
          const response = JSON.parse(result.body);
          if (this.isResponseOK(response)) {
            let contests = this.getContestsList(response).map((contest) => {
              return this.getContestMapping(contest);
            });
            contests = _.sortBy(contests, 'startTimeMs');
            resolve(contests);
          } else {
            logger.error('API call returned with error!');
          }
        } else {
          logger.error("Unable to fetch contests: " + error);
        }
      }); 
    });
  }

  static isResponseOK(response) {
    return !_.isEmpty(response);
  }

  static getContestsList(response) {
    return response;
  }
};

module.exports = baseContestAPI;
