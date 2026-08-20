const express = require('express');

function clampPageSize(value, fallback, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

function clampPage(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildCrudRouter(Model, pkColumns, { defaultPageSize, maxPageSize }) {
  const route = express.Router();
  const pkColumn = pkColumns[0] || 'id';

  route.post('/', async (req, res) => {
    try {
      const newRecord = await Model.create(req.body);
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ error: 'Bad Request' });
    }
  });

  route.get('/', async (req, res) => {
    try {
      const page = clampPage(req.query.page);
      const limit = clampPageSize(req.query.limit, defaultPageSize, maxPageSize);
      const offset = (page - 1) * limit;
      const includeAssociations = req.query.include === 'true';

      const { count, rows } = await Model.findAndCountAll({
        limit,
        offset,
        include: includeAssociations ? { all: true } : undefined,
      });

      res.json({
        data: rows,
        meta: {
          page,
          limit,
          total: count,
          totalPages: Math.max(1, Math.ceil(count / limit)),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error All' });
    }
  });

  route.get('/:id', async (req, res) => {
    try {
      const record = await Model.findOne({
        where: { [pkColumn]: req.params.id },
        include: { all: true },
      });
      if (record) {
        res.json(record);
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error By ID' });
    }
  });

  route.put('/:id', async (req, res) => {
    try {
      const [updatedCount] = await Model.update(req.body, {
        where: { [pkColumn]: req.params.id },
      });

      if (updatedCount > 0) {
        const updatedRecord = await Model.findOne({ where: { [pkColumn]: req.params.id }, include: { all: true } });
        res.json(updatedRecord);
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  route.delete('/:id', async (req, res) => {
    try {
      const deletedCount = await Model.destroy({ where: { [pkColumn]: req.params.id } });

      if (deletedCount > 0) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return route;
}

module.exports = { buildCrudRouter };
