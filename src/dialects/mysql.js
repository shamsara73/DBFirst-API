const { DataTypes } = require('sequelize');

// Maps INFORMATION_SCHEMA.COLUMNS.DATA_TYPE (lowercase) to a Sequelize type
const typeMap = {
  int: DataTypes.INTEGER,
  tinyint: DataTypes.INTEGER,
  smallint: DataTypes.INTEGER,
  mediumint: DataTypes.INTEGER,
  bit: DataTypes.BOOLEAN,
  bigint: DataTypes.BIGINT,
  varchar: DataTypes.STRING,
  char: DataTypes.CHAR,
  text: DataTypes.TEXT,
  mediumtext: DataTypes.TEXT,
  longtext: DataTypes.TEXT,
  float: DataTypes.FLOAT,
  double: DataTypes.DOUBLE,
  decimal: DataTypes.DECIMAL,
  date: DataTypes.DATEONLY,
  datetime: DataTypes.DATE,
  timestamp: DataTypes.DATE,
  json: DataTypes.JSON,
  enum: DataTypes.STRING,
};

function buildSequelizeOptions(env) {
  return {
    dialect: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : 3306,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
  };
}

async function listTables(sequelize, database) {
  const rows = await sequelize.query(
    `SELECT TABLE_NAME AS tableName FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = :database`,
    { replacements: { database }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.tableName);
}

async function listColumns(sequelize, database, tableName) {
  return sequelize.query(
    `SELECT COLUMN_NAME AS columnName, DATA_TYPE AS dataType
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_NAME = :tableName AND TABLE_SCHEMA = :database
     ORDER BY ORDINAL_POSITION`,
    { replacements: { tableName, database }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getPrimaryKeyColumns(sequelize, database, tableName) {
  const rows = await sequelize.query(
    `SELECT COLUMN_NAME AS columnName
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_NAME = :tableName AND TABLE_SCHEMA = :database
       AND CONSTRAINT_NAME = 'PRIMARY'
     ORDER BY ORDINAL_POSITION`,
    { replacements: { tableName, database }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.columnName);
}

async function listForeignKeys(sequelize, database) {
  const rows = await sequelize.query(
    `SELECT TABLE_NAME AS tableWithForeignKey,
            COLUMN_NAME AS foreignKeyColumn,
            REFERENCED_TABLE_NAME AS dependentOnTable,
            REFERENCED_COLUMN_NAME AS referencedColumn
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = :database
     ORDER BY TABLE_NAME`,
    { replacements: { database }, type: sequelize.QueryTypes.SELECT }
  );
  return rows;
}

module.exports = { typeMap, buildSequelizeOptions, listTables, listColumns, getPrimaryKeyColumns, listForeignKeys };
