'use strict';

const config = require('config');
const { Client } = require('pg');

let db;

if (process.env.DATABASE_URL) {
  // production
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
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
  subscribeUser: (psid) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO subscribers(psid) values($1)', [ psid ], (error, result) => {
        if (error) {
          if (error.detail.indexOf('already exists') != -1) {
            resolve('duplicate');
          } else {
            resolve('error');
          }
        } else {
          resolve('ok');
        }
      });
    });
  },

  unsubscribeUser: (psid) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM subscribers WHERE psid = ($1)', [ psid ], (error, result) => {
        if (error) {
          resolve('error');
        } else if (result.rowCount === 0) {
          resolve('not_found');
        } else {
          resolve('ok');
        }
      });
    });
  },

  getSubscribers: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM subscribers', (err, res) => {
        if (!err) {
          resolve(res.rows);
        } else {
          resolve(false);
        }
      });
    });
  },
};

module.exports = dbUtils;