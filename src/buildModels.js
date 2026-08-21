// Introspects the connected database via the dialect adapter and builds
// Sequelize models + belongsTo/hasMany associations from real FK metadata.
async function buildModels(sequelize, adapter, database) {
  const tableNames = await adapter.listTables(sequelize, database);
  const models = {};
  const primaryKeys = {};

  for (const tableName of tableNames) {
    const columns = await adapter.listColumns(sequelize, database, tableName);
    const pkColumns = await adapter.getPrimaryKeyColumns(sequelize, database, tableName);
    primaryKeys[tableName] = pkColumns;

    const attributes = {};
    for (const column of columns) {
      const sequelizeType = adapter.typeMap[column.dataType.toLowerCase()];
      if (!sequelizeType) {
        console.warn(`Unsupported data type for column '${column.columnName}' in table '${tableName}': ${column.dataType}`);
        continue;
      }
      attributes[column.columnName] = {
        type: sequelizeType,
        primaryKey: pkColumns.includes(column.columnName),
      };
    }

    models[tableName] = sequelize.define(tableName, attributes, {
      tableName,
      freezeTableName: true,
      timestamps: false,
    });
  }

  const foreignKeys = await adapter.listForeignKeys(sequelize, database);
  for (const fk of foreignKeys) {
    const Model = models[fk.tableWithForeignKey];
    const relatedModel = models[fk.dependentOnTable];
    if (!Model || !relatedModel) continue;

    Model.belongsTo(relatedModel, { foreignKey: fk.foreignKeyColumn, as: fk.dependentOnTable });
    relatedModel.hasMany(Model, { foreignKey: fk.foreignKeyColumn, as: `${fk.tableWithForeignKey}s` });
  }

  return { models, primaryKeys };
}

module.exports = { buildModels };
