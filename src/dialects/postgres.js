const { DataTypes } = require('sequelize');

const typeMap = {
  integer: DataTypes.INTEGER,
  smallint: DataTypes.INTEGER,
  bigint: DataTypes.BIGINT,
  boolean: DataTypes.BOOLEAN,
  'character varying': DataTypes.STRING,
  varchar: DataTypes.STRING,
  character: DataTypes.CHAR,
  char: DataTypes.CHAR,
  text: DataTypes.TEXT,
  real: DataTypes.FLOAT,
  'double precision': DataTypes.DOUBLE,
  numeric: DataTypes.DECIMAL,
  decimal: DataTypes.DECIMAL,
  date: DataTypes.DATEONLY,
  timestamp: DataTypes.DATE,
  'timestamp without time zone': DataTypes.DATE,
  'timestamp with time zone': DataTypes.DATE,
  json: DataTypes.JSON,
  jsonb: DataTypes.JSONB,
  uuid: DataTypes.UUIDV4,
};

function buildSequelizeOptions(env) {
  return {
    dialect: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : 5432,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
  };
}

async function listTables(sequelize) {
  const rows = await sequelize.query(
    `SELECT table_name AS "tableName" FROM information_schema.tables
     WHERE table_type = 'BASE TABLE' AND table_schema = 'public'`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.tableName);
}

async function listColumns(sequelize, database, tableName) {
  return sequelize.query(
    `SELECT column_name AS "columnName", data_type AS "dataType"
     FROM information_schema.columns
     WHERE table_name = :tableName AND table_schema = 'public'
     ORDER BY ordinal_position`,
    { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getPrimaryKeyColumns(sequelize, database, tableName) {
  const rows = await sequelize.query(
    `SELECT kcu.column_name AS "columnName"
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
     WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = :tableName AND tc.table_schema = 'public'
     ORDER BY kcu.ordinal_position`,
    { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.columnName);
}

async function listForeignKeys(sequelize) {
  const rows = await sequelize.query(
    `SELECT tc.table_name AS "tableWithForeignKey",
            kcu.column_name AS "foreignKeyColumn",
            ccu.table_name AS "dependentOnTable",
            ccu.column_name AS "referencedColumn"
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
     WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
     ORDER BY tc.table_name`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return rows;
}

module.exports = { typeMap, buildSequelizeOptions, listTables, listColumns, getPrimaryKeyColumns, listForeignKeys };
