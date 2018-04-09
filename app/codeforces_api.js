'use strict';

const request = require('request'),
      _ = require('lodash'),
      moment = require('moment');


const fetchContests = () => {
  return new Promise((resolve, reject) => {
    request({
      "uri": "http://codeforces.com/api/contest.list",
      "method": "GET"
    }, (error, result, body) => {
      if (!error) {
        const response = JSON.parse(result.body);
        if (response.status === 'OK') {
          let contests = response.result.map((contest) => {
            return _.pick(contest, [ 'id', 'name', 'startTimeSeconds' ]);
          });
          contests = _.sortBy(contests, 'startTimeSeconds');
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


const codeforcesAPI = {
  /*
   * Calls Codeforces API and select future contests.
   */
  fetchFutureContests: () => {
    return new Promise((resolve, reject) => {
      fetchContests().then((contests) => {
        contests = filterFutureContests(contests);
        resolve(contests);
      });
    });
  },
};

module.exports = codeforcesAPI;
