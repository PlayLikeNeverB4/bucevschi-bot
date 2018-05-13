'use strict';

const { exec } = require('child_process');
const config = require('config'),
      logger = require('winston');

const DATABASE_URL = config.get('dbConnectionString') ||
                     process.env.DATABASE_URL;

exec(`DATABASE_URL=${ DATABASE_URL } node_modules/db-migrate/bin/db-migrate up`, (err, stdout, stderr) => {
  if (err) {
    logger.error("Migrations script returned with error!");
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  logger.info("Migrations script finished!");
});
