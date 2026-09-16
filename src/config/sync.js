/**
 * Run with `npm run db:migrate`.
 * Creates/updates tables in Postgres to match the Sequelize models.
 * Use { force: true } only in local dev if you want to drop and recreate tables.
 */
const sequelize = require('./db');
require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Unable to sync database:', err);
    process.exit(1);
  }
})();
