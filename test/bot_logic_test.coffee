rewire = require 'rewire'
botLogic = rewire '../app/bot_logic'
dbUtils = require '../app/db_utils'
chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
chai.use(chaiAsPromised)
expect = chai.expect
sinon = require 'sinon'
moment = require 'moment'
_ = require 'lodash'

now = moment().unix()

describe 'bot_logic', ->
  describe 'getReminderText', ->
    it 'should compute correct text', ->
      reminder =
        contestStartTime: now + 3600 * 24 - 23
        contestName: 'Contest name'

      reminderText = botLogic.getReminderText(reminder)

      expect(reminderText).to.contain('24 de ore')
