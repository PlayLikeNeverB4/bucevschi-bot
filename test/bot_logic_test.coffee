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

moment.locale('ro');
moment.tz.setDefault('UTC');

now = moment().unix() * 1000

describe 'bot_logic', ->
  describe 'getReminderText', ->
    it 'should compute correct text', ->
      reminder =
        contestStartTimeMs: now + 3600 * 24 * 1000 - 23
        contestName: 'Contest name'
        contestSource: 'CF'

      reminderText = botLogic.getReminderText(reminder)

      expect(reminderText).to.contain('o zi')
