'use strict';

const { Client } = require('pg');
const config = require('config'),
      logger = require("winston");

let db;

logger.info('Connecting to the database');
if (process.env.DATABASE_URL) {
  // production
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // local
  const DB_CONNECTION_STRING = config.get('dbConnectionString');
  db = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: false,
  });
}

db.connect();


const dbUtils = {
  /*
   * Adds user to subscribers list.
   */
  subscribeUser: (psid) => {
    return new Promise((resolve) => {
      db.query('INSERT INTO subscribers(psid) values($1)', [ psid, ],
        (error) => {
          if (error) {
            if (error.detail.indexOf('already exists') !== -1) {
              resolve('duplicate');
            } else {
              resolve('error');
            }
          } else {
            resolve('ok');
          }
        }
      );
    });
  },

  /*
   * Removes user from subscribers list.
   */
  unsubscribeUser: (psid) => {
    return new Promise((resolve) => {
      db.query('DELETE FROM subscribers WHERE psid = ($1)', [ psid, ],
        (error, result) => {
          if (error) {
            resolve('error');
          } else if (result.rowCount === 0) {
            resolve('not_found');
          } else {
            resolve('ok');
          }
        }
      );
    });
  },

  /*
   * Fetches subscribers list from the db.
   */
  getSubscribers: () => {
    return new Promise((resolve) => {
      db.query('SELECT psid FROM subscribers', (err, res) => {
        if (!err) {
          resolve(res.rows);
        } else {
          resolve(false);
        }
      });
    });
  },

  /*
   * Adds sent reminders to the reminders list.
   */
  saveReminders: (reminders) => {
    reminders.forEach((reminder) => {
      db.query("INSERT INTO reminders(contest_id, last_sent) \
                VALUES ($1, NOW()) \
                ON CONFLICT (contest_id) DO UPDATE \
                SET last_sent = NOW()", [ reminder.contestId, ], (err) => {
        if (err) {
          logger.error('Error while saving reminders!');
        }
      });
    });
  },

  /*
   * Fetches sent reminders list from the db.
   */
  getReminders: () => {
    return new Promise((resolve) => {
      db.query(`SELECT contest_id, last_sent FROM reminders`, (err, res) => {
        if (!err) {
          resolve(res.rows);
        } else {
          resolve(false);
        }
      });
    });
  },

  /*
   * Deletes old useless reminders from the db.
   */
  removeOldReminders: () => {
    db.query(
      `DELETE FROM reminders WHERE last_sent < NOW() - INTERVAL '30 days'`,
      (err) => {
        if (err) {
          logger.error('Error while deleting old reminders!');
        }
      }
    );
  },
};

module.exports = dbUtils;
