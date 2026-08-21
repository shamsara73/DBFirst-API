const express = require('express');
const expressListEndpoints = require('express-list-endpoints');
const swaggerUi = require('swagger-ui-express');

const { loadConfig } = require('./src/config');
const { buildModels } = require('./src/buildModels');
const { buildCrudRouter } = require('./src/routes');
const { apiKeyAuth } = require('./src/middleware/auth');
const generateSpecs = require('./swagger');

async function start() {
  const config = loadConfig();
  const app = express();
  app.use(express.json());

  if (!config.apiKey) {
    console.warn(
      'WARNING: API_KEY is not set. All generated CRUD routes are unauthenticated. Set API_KEY in your .env for anything beyond local/demo use.'
    );
  }

  await config.sequelize.authenticate();
  const { models, primaryKeys } = await buildModels(config.sequelize, config.adapter, config.database);
  await config.sequelize.sync();

  if (config.adapter.isDemo && typeof config.adapter.seed === 'function') {
    await config.adapter.seed(models);
    console.log('DEMO mode: seeded an in-memory SQLite database with the sample e-commerce schema.');
  }

  app.get('/health', (req, res) => res.json({ status: 'ok', dialect: config.dialectName }));

  const dataRouter = express.Router();
  dataRouter.use(apiKeyAuth(config.apiKey));

  for (const tableName in models) {
    const route = buildCrudRouter(models[tableName], primaryKeys[tableName], {
      defaultPageSize: config.defaultPageSize,
      maxPageSize: config.maxPageSize,
    });
    dataRouter.use(`/${tableName}`, route);
  }
  const routes = expressListEndpoints(dataRouter);
  const swaggerSpec = generateSpecs(routes, models);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(dataRouter);

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} (dialect: ${config.dialectName})`);
    console.log(`Swagger docs: http://localhost:${config.port}/api-docs/`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
