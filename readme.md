# Express JS Automatic REST API

Express JS Automatic REST API is an Express JS API that automatically generates routes and swagger based on every table on the database.

## Supported Database

(V) Microsoft SQL Server
(V) MySQL
(V) PostgreSQL
(V) Demo (embedded SQLite, no server needed)
(-) Oracle

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

```
DIALECT=mysql   # mysql | postgres | mssql | demo
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password

PORT=3000
API_KEY=change-me   # required in every generated route's x-api-key header; leave unset only for local/demo use
DEFAULT_PAGE_SIZE=50
MAX_PAGE_SIZE=200
```

## Usage

```bash
npm start
```

Access the API Swagger endpoint (public, no API key needed) at:

```
http://localhost:3000/api-docs/
```

Every other generated route requires the `x-api-key` header when `API_KEY` is set:

```bash
curl -H "x-api-key: change-me" http://localhost:3000/products
```

### List endpoint pagination

`GET /:table` supports:

- `?page=1&limit=50` — pagination (bounded by `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE`)
- `?include=true` — eager-load associations (off by default to avoid over-fetching)

Response shape: `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }`.

## Try it instantly with DEMO mode

No database required:

```bash
npm run demo
```

This boots an embedded SQLite database seeded with a small sample e-commerce schema (`products`, `product_categories`, `customers`, `orders`, `order_items`) mirroring `mysql-sample.sql` / `postgresql-sample.sql`, so you can explore the generated CRUD routes and Swagger docs immediately.

## Sample schemas

`mysql-sample.sql` and `postgresql-sample.sql` contain a larger sample e-commerce schema you can load into a real MySQL/PostgreSQL instance and point `DIALECT=mysql`/`DIALECT=postgres` at.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
