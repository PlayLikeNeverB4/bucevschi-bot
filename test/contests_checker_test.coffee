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

now = moment().unix() * 1000

ONE_HOUR_IN_MS = 3600 * 1000

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
          startTimeMs: null
          source: 'CF'
        }
      ]

    it 'should not send reminder if more than 24h left', ->
      @contests[0].startTimeMs = now + ONE_HOUR_IN_MS * 24 + 2000
      expect(@getReminders(@contests)).to.eventually.be.empty

    it 'should send reminder if less than 24h left', ->
      @contests[0].startTimeMs = now + ONE_HOUR_IN_MS * 24 - 2000
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
          startTimeMs: null
          source: 'CF'
        }
      ]

    it 'should not send reminder if more than 2h left', ->
      @contests[0].startTimeMs = now + ONE_HOUR_IN_MS * 2 + 2000
      @previousReminder.last_sent = @contests[0].startTimeMs - ONE_HOUR_IN_MS * 24 + 2000
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([ @previousReminder ])
      expect(@getReminders(@contests)).to.eventually.be.empty
      dbUtils.getReminders.restore()

    it 'should send reminder if less than 2h left', ->
      @contests[0].startTimeMs = now + ONE_HOUR_IN_MS * 2 - 2000
      @previousReminder.last_sent = @contests[0].startTimeMs - ONE_HOUR_IN_MS * 24 + 2000
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
          startTimeMs: null
          source: 'CF'
        }
      ]

    it 'should not send reminder in any situation', ->
      @contests[0].startTimeMs = now + 2000
      @previousReminder.last_sent = @contests[0].startTimeMs - ONE_HOUR_IN_MS * 2
      sinon.stub(dbUtils, 'getReminders').callsFake () => Promise.resolve([ @previousReminder ])
      expect(@getReminders(@contests)).to.eventually.be.empty
      dbUtils.getReminders.restore()
