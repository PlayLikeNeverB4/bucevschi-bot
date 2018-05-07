rewire = require 'rewire'
contestsAPI = rewire '../app/contests_api'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use(chaiAsPromised)
expect = chai.expect
sinon = require 'sinon'
moment = require 'moment'
_ = require 'lodash'
request = require('request')
logger = require('winston')

logger.remove(logger.transports.Console);
logger.add logger.transports.Console,
  "level": "error"

now = moment.now()

codeforcesAPI = require('../app/apis/codeforces_api')
atcoderAPI = require('../app/apis/atcoder_api')
csacademyAPI = require('../app/apis/csacademy_api')

describe 'contests_api', ->
  describe 'fetchFutureContests', ->
    afterEach ->
      codeforcesAPI.fetchContests.restore()
      atcoderAPI.fetchContests.restore()
      request.get.restore()

    it 'should not crash if one of the APIs throws an exception', ->
      sinon.stub(codeforcesAPI, 'fetchContests').callsFake () => Promise.resolve([ { contestId: 5454, startTimeMs: now + 2000 } ])
      sinon.stub(atcoderAPI, 'fetchContests').callsFake () => Promise.resolve([ { contestId: 123, startTimeMs: now + 2000 } ])
      sinon.stub(request, 'get').callsFake () =>
        throw new Error("random API exception")

      contestsAPI.fetchFutureContests().then (contests) =>
        expect(contests).to.have.length(2)
