rewire = require 'rewire'
contestsChecker = rewire '../app/contests_checker'
dbUtils = require '../app/db_utils'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use(chaiAsPromised)
expect = chai.expect
sinon = require 'sinon'
moment = require 'moment'
_ = require 'lodash'

now = moment().unix()

describe 'contest_checker', ->
  before ->
    @getReminders = contestsChecker.__get__('getReminders')

  describe 'getReminders (when no previous)', ->
    before ->
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([])

    after ->
      dbUtils.getReminders.restore()

    beforeEach ->
      @contests = [
        {
          id: 123
          name: 'Contest name'
          startTimeSeconds: null,
        }
      ]

    it 'should not send reminder if more than 24h left', ->
      @contests[0].startTimeSeconds = now + 3600 * 24 + 2
      expect(@getReminders(@contests)).to.eventually.be.empty

    it 'should send reminder if less than 24h left', ->
      @contests[0].startTimeSeconds = now + 3600 * 24
      expect(@getReminders(@contests)).to.eventually.not.be.empty

  describe 'getReminders (when previous was 24h before)', ->
    before ->
      @previousReminder =
        contest_id: 'CF123'
        last_sent: null

    beforeEach ->
      @contests = [
        {
          id: 123
          name: 'Contest name'
          startTimeSeconds: null,
        }
      ]

    it 'should not send reminder if more than 2h left', ->
      @contests[0].startTimeSeconds = now + 3600 * 2 + 2
      @previousReminder.last_sent = (@contests[0].startTimeSeconds - 3600 * 24) * 1000
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([ @previousReminder ])
      expect(@getReminders(@contests)).to.eventually.be.empty
      dbUtils.getReminders.restore()

    it 'should send reminder if less than 2h left', ->
      @contests[0].startTimeSeconds = now + 3600 * 2
      @previousReminder.last_sent = (@contests[0].startTimeSeconds - 3600 * 24) * 1000
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([ @previousReminder ])
      expect(@getReminders(@contests)).to.eventually.not.be.empty
      dbUtils.getReminders.restore()

  describe 'getReminders (when previous was 2h before)', ->
    before ->
      @previousReminder =
        contest_id: 'CF123'
        last_sent: null

    beforeEach ->
      @contests = [
        {
          id: 123
          name: 'Contest name'
          startTimeSeconds: null,
        }
      ]

    it 'should not send reminder in any situation', ->
      @contests[0].startTimeSeconds = now + 20
      @previousReminder.last_sent = (@contests[0].startTimeSeconds - 3600 * 2) * 1000
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([ @previousReminder ])
      expect(@getReminders(@contests)).to.eventually.be.empty
      dbUtils.getReminders.restore()
