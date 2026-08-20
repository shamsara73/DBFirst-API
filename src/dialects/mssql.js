const { DataTypes } = require('sequelize');

const typeMap = {
  int: DataTypes.INTEGER,
  smallint: DataTypes.INTEGER,
  tinyint: DataTypes.INTEGER,
  bit: DataTypes.BOOLEAN,
  bigint: DataTypes.BIGINT,
  varchar: DataTypes.STRING,
  nvarchar: DataTypes.STRING,
  char: DataTypes.CHAR,
  nchar: DataTypes.CHAR,
  text: DataTypes.TEXT,
  ntext: DataTypes.TEXT,
  float: DataTypes.FLOAT,
  real: DataTypes.FLOAT,
  decimal: DataTypes.DECIMAL,
  numeric: DataTypes.DECIMAL,
  money: DataTypes.DECIMAL,
  date: DataTypes.DATEONLY,
  datetime: DataTypes.DATE,
  datetime2: DataTypes.DATE,
  uniqueidentifier: DataTypes.UUIDV4,
};

function buildSequelizeOptions(env) {
  return {
    dialect: 'mssql',
    host: env.DB_HOST,
    port: env.DB_PORT ? Number(env.DB_PORT) : 1433,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
  };
}

async function listTables(sequelize) {
  const rows = await sequelize.query(
    `SELECT table_name AS tableName FROM information_schema.tables WHERE table_type = 'BASE TABLE'`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.tableName);
}

async function listColumns(sequelize, database, tableName) {
  return sequelize.query(
    `SELECT COLUMN_NAME AS columnName, DATA_TYPE AS dataType
     FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName
     ORDER BY ORDINAL_POSITION`,
    { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getPrimaryKeyColumns(sequelize, database, tableName) {
  const rows = await sequelize.query(
    `SELECT kcu.COLUMN_NAME AS columnName
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
     JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
     WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' AND tc.TABLE_NAME = :tableName
     ORDER BY kcu.ORDINAL_POSITION`,
    { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => r.columnName);
}

async function listForeignKeys(sequelize) {
  const rows = await sequelize.query(
    `SELECT t.name AS tableWithForeignKey,
            c.name AS foreignKeyColumn,
            t2.name AS dependentOnTable,
            c2.name AS referencedColumn
     FROM sys.foreign_key_columns AS fk
     INNER JOIN sys.tables AS t ON fk.parent_object_id = t.object_id
     INNER JOIN sys.columns AS c ON fk.parent_object_id = c.object_id AND fk.parent_column_id = c.column_id
     INNER JOIN sys.columns AS c2 ON c2.object_id = fk.referenced_object_id AND c2.column_id = fk.referenced_column_id
     INNER JOIN sys.tables AS t2 ON t2.object_id = c2.object_id
     ORDER BY tableWithForeignKey`,
    { type: sequelize.QueryTypes.SELECT }
  );
  return rows;
}

module.exports = { typeMap, buildSequelizeOptions, listTables, listColumns, getPrimaryKeyColumns, listForeignKeys };
