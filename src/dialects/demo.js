const { DataTypes } = require('sequelize');

// DEMO mode needs no external server: it boots an embedded SQLite database
// and seeds it with the same sample e-commerce schema shipped in
// mysql-sample.sql / postgresql-sample.sql, so `DIALECT=demo npm start`
// works out of the box.
const typeMap = {
  integer: DataTypes.INTEGER,
  boolean: DataTypes.BOOLEAN,
  bigint: DataTypes.BIGINT,
  varchar: DataTypes.STRING,
  char: DataTypes.CHAR,
  text: DataTypes.TEXT,
  float: DataTypes.FLOAT,
  decimal: DataTypes.DECIMAL,
  date: DataTypes.DATEONLY,
  datetime: DataTypes.DATE,
};

function buildSequelizeOptions(env) {
  return {
    dialect: 'sqlite',
    storage: env.DEMO_STORAGE || ':memory:',
  };
}

const SCHEMA = [
  {
    name: 'product_categories',
    columns: { id: 'integer', name: 'varchar' },
  },
  {
    name: 'products',
    columns: {
      id: 'integer',
      name: 'varchar',
      description: 'text',
      price: 'decimal',
      stock_quantity: 'integer',
    },
  },
  {
    name: 'product_category_relationship',
    columns: { id: 'integer', product_id: 'integer', category_id: 'integer' },
    foreignKeys: [
      { column: 'product_id', referencesTable: 'products', referencesColumn: 'id' },
      { column: 'category_id', referencesTable: 'product_categories', referencesColumn: 'id' },
    ],
  },
  {
    name: 'customers',
    columns: {
      id: 'integer',
      username: 'varchar',
      password_hash: 'char',
      first_name: 'varchar',
      last_name: 'varchar',
      email: 'varchar',
    },
  },
  {
    name: 'orders',
    columns: {
      id: 'integer',
      customer_id: 'integer',
      order_date: 'datetime',
      total_amount: 'decimal',
    },
    foreignKeys: [{ column: 'customer_id', referencesTable: 'customers', referencesColumn: 'id' }],
  },
  {
    name: 'order_items',
    columns: {
      id: 'integer',
      order_id: 'integer',
      product_id: 'integer',
      quantity: 'integer',
      unit_price: 'decimal',
    },
    foreignKeys: [
      { column: 'order_id', referencesTable: 'orders', referencesColumn: 'id' },
      { column: 'product_id', referencesTable: 'products', referencesColumn: 'id' },
    ],
  },
];

const SEED_DATA = {
  product_categories: [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Books' },
  ],
  products: [
    { id: 1, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 19.99, stock_quantity: 120 },
    { id: 2, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 59.99, stock_quantity: 45 },
    { id: 3, name: 'Node.js in Action', description: 'A book about Node.js', price: 29.5, stock_quantity: 30 },
  ],
  product_category_relationship: [
    { id: 1, product_id: 1, category_id: 1 },
    { id: 2, product_id: 2, category_id: 1 },
    { id: 3, product_id: 3, category_id: 2 },
  ],
  customers: [
    { id: 1, username: 'jdoe', password_hash: 'x'.repeat(64), first_name: 'John', last_name: 'Doe', email: 'jdoe@example.com' },
    { id: 2, username: 'asmith', password_hash: 'y'.repeat(64), first_name: 'Alice', last_name: 'Smith', email: 'asmith@example.com' },
  ],
  orders: [
    { id: 1, customer_id: 1, order_date: new Date('2026-01-05'), total_amount: 79.98 },
    { id: 2, customer_id: 2, order_date: new Date('2026-02-14'), total_amount: 29.5 },
  ],
  order_items: [
    { id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 19.99 },
    { id: 2, order_id: 1, product_id: 2, quantity: 1, unit_price: 59.99 },
    { id: 3, order_id: 2, product_id: 3, quantity: 1, unit_price: 29.5 },
  ],
};

async function listTables() {
  return SCHEMA.map((t) => t.name);
}

async function listColumns(sequelize, database, tableName) {
  const table = SCHEMA.find((t) => t.name === tableName);
  return Object.entries(table.columns).map(([columnName, dataType]) => ({ columnName, dataType }));
}

async function getPrimaryKeyColumns(sequelize, database, tableName) {
  return ['id'];
}

async function listForeignKeys() {
  const rows = [];
  for (const table of SCHEMA) {
    for (const fk of table.foreignKeys || []) {
      rows.push({
        tableWithForeignKey: table.name,
        foreignKeyColumn: fk.column,
        dependentOnTable: fk.referencesTable,
        referencedColumn: fk.referencesColumn,
      });
    }
  }
  return rows;
}

// Called once after models are defined and synced, to load the sample rows.
async function seed(models) {
  for (const [tableName, rows] of Object.entries(SEED_DATA)) {
    const Model = models[tableName];
    if (!Model || !rows.length) continue;
    await Model.bulkCreate(rows);
  }
}

module.exports = {
  typeMap,
  buildSequelizeOptions,
  listTables,
  listColumns,
  getPrimaryKeyColumns,
  listForeignKeys,
  seed,
  isDemo: true,
};
