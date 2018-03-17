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
    // client.query('INSERT INTO items(text, complete) values($1, $2)',
    //     [data.text, data.complete]);

  },

  unsubscribeUser: (psid) => {
    // client.query('DELETE FROM items WHERE id=($1)', [id]);
    // // SQL Query > Select Data
    // var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // // Stream results back one row at a time
    // query.on('row', (row) => {
    //   results.push(row);
    // });
    // // After all data is returned, close connection and return results
    // query.on('end', () => {
    //   done();
    //   return res.json(results);
    // });
  },

  getSubscribers: () => {
    // const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // // Stream results back one row at a time
    // query.on('row', (row) => {
    //   results.push(row);
    // });
    // // After all data is returned, close connection and return results
    // query.on('end', () => {
    //   done();
    //   return res.json(results);
    // });

    // db.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    //   if (err) throw err;
    //   for (let row of res.rows) {
    //     console.log(JSON.stringify(row));
    //   }
    //   db.end();
    // });
  },
};

module.exports = dbUtils;