require('dotenv').config();
const { Sequelize } = require('sequelize');

const dialects = {
  mysql: require('./dialects/mysql'),
  postgres: require('./dialects/postgres'),
  mssql: require('./dialects/mssql'),
  demo: require('./dialects/demo'),
};

function loadConfig(env = process.env) {
  const dialectName = (env.DIALECT || 'demo').toLowerCase();
  const adapter = dialects[dialectName];
  if (!adapter) {
    throw new Error(`Unsupported DIALECT '${dialectName}'. Supported: ${Object.keys(dialects).join(', ')}`);
  }

  const sequelizeOptions = adapter.buildSequelizeOptions(env);
  const sequelize = adapter.isDemo
    ? new Sequelize(sequelizeOptions)
    : new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, { ...sequelizeOptions, logging: false });

  return {
    dialectName,
    adapter,
    sequelize,
    database: env.DB_NAME,
    port: Number(env.PORT || 3000),
    apiKey: env.API_KEY || null,
    defaultPageSize: Number(env.DEFAULT_PAGE_SIZE || 50),
    maxPageSize: Number(env.MAX_PAGE_SIZE || 200),
  };
}

module.exports = { loadConfig };
