'use strict';

const _ = require('lodash'),
      moment = require('moment'),
      contestsAPI = require('../contests_api'),
      baseMessageHandler = require('./base_message_handler');

const buildUpcomingContestMessage = (contest) => {
  const timeString = moment(contest.startTimeMs).fromNow(true);
  const sourceInfo = contestsAPI.SOURCES_INFO[contest.source];

  let sourceText = '';
  let contestURL = '';
  if (sourceInfo && sourceInfo.prettyName) {
    const sourcePrettyName = sourceInfo.prettyName;
    sourceText = `[${ sourcePrettyName }] `;
  } else {
    // Manual contest
    if (contest.sourceName) {
      const sourcePrettyName = contest.sourceName;
      sourceText = `[${ sourcePrettyName }] `;
    }
    if (contest.url) {
      contestURL = contest.url;
    }
  }

  return `[${ timeString }] ${ sourceText }${ contest.name } ${ contestURL }`;
};

const buildUpcomingContestsMessage = (contests) => {
  let text;
  if (!_.isEmpty(contests)) {
    text = 'Urmatoarele concursuri sunt:\n';

    contests.forEach((contest) => {
      text += buildUpcomingContestMessage(contest) + '\n';
    });

    _.forOwn(contestsAPI.SOURCES_INFO, (sourceInfo, sourceId) => {
      if (sourceInfo.prettyName && sourceInfo.contestsURL) {
        const anyContestWithSource = _.some(
                                      contests,
                                      (contest) => contest.source === sourceId
                                    );
        if (anyContestWithSource) {
          text += `${ sourceInfo.prettyName }: ${ sourceInfo.contestsURL }\n`;
        }
      }
    });
  } else {
    text = 'Nu urmeaza niciun concurs in viitorul apropiat :O';
  }

  return text;
};

class upcomingHandler extends baseMessageHandler {
  static meetsCondition(receivedText) {
    receivedText = receivedText.toLowerCase();
    return receivedText.includes('next') ||
           receivedText.includes('upcoming') ||
           receivedText.includes('urmatoare') ||
           receivedText.includes('continuare');
  }

  static run() {
    return new Promise((resolve) => {
      contestsAPI.fetchFutureContests().then((contests) => {
        this.resolveSimpleMessage(
          resolve,
          buildUpcomingContestsMessage(contests)
        );
      });
    });
  }
}

module.exports = upcomingHandler;
