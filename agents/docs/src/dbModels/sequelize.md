# Sequelize Database Connection Utility

This module provides a configured [Sequelize](https://sequelize.org/) instance for connecting to a PostgreSQL database, with environment-aware settings for production and development. It also exports a utility function to establish and verify the database connection.

**File:** `@policysynth/agents/dbModels/sequelize.js`

---

## Properties

| Name       | Type         | Description                                                                                 |
|------------|--------------|---------------------------------------------------------------------------------------------|
| sequelize  | Sequelize    | The configured Sequelize instance for interacting with the PostgreSQL database.             |

---

## Functions

| Name                | Parameters | Return Type | Description                                                                                      |
|---------------------|------------|-------------|--------------------------------------------------------------------------------------------------|
| connectToDatabase   | none       | Promise<void> | Authenticates the Sequelize instance and logs the connection status. Exits process on failure.   |

---

## Environment Variables

The configuration is controlled by the following environment variables:

- `NODE_ENV`: Determines the environment (`production`, `development`, etc.).
- `DATABASE_URL`: The full database connection string (used in production).
- `DISABLE_PG_SSL`: If set, disables SSL in production.
- `PSQL_DB_NAME`, `PSQL_DB_USER`, `PSQL_DB_PASS`, `DB_HOST`, `DB_PORT`: Used for custom development database configuration.
- `YP_DEV_DATABASE_NAME`, `YP_DEV_DATABASE_USERNAME`, `YP_DEV_DATABASE_PASSWORD`: Alternative development database credentials.

---

## Logging

- In non-production environments, SQL queries are logged with colored output using the [colors](https://www.npmjs.com/package/colors) package.
- The `logQuery` function logs the query, bind parameters, and a timestamp.

---

## Example

```typescript
import { sequelize, connectToDatabase } from '@policysynth/agents/dbModels/sequelize.js';

(async () => {
  await connectToDatabase();

  // You can now use `sequelize` to define models, run queries, etc.
  // Example: await sequelize.query('SELECT 1+1 AS result');
})();
```

---

## Implementation Details

- **Production Mode:**  
  - Uses `DATABASE_URL` for connection.
  - SSL is enabled by default unless `DISABLE_PG_SSL` is set.
  - Query logging is disabled.
- **Development Mode:**  
  - Uses individual environment variables for database credentials.
  - SSL is not required.
  - Query logging is enabled with colored output.
- **Error Handling:**  
  - If connection fails, logs the error and exits the process.
  - If no database configuration is found, logs an error.

---

## Notes

- The `sequelize` instance is exported and can be used to define models or run raw queries.
- The `connectToDatabase` function should be called before performing any database operations to ensure the connection is established.
- The code uses ES module syntax and utilities like `fileURLToPath` and `dirname` for path resolution.

---

## Dependencies

- [sequelize](https://www.npmjs.com/package/sequelize)
- [pg](https://www.npmjs.com/package/pg)
- [colors](https://www.npmjs.com/package/colors)
- [lodash](https://www.npmjs.com/package/lodash)
- [path](https://nodejs.org/api/path.html)
- [url](https://nodejs.org/api/url.html)

---

## Summary Table

| Export                | Type         | Description                                      |
|-----------------------|--------------|--------------------------------------------------|
| `sequelize`           | Sequelize    | The Sequelize instance for DB operations.         |
| `connectToDatabase`   | Function     | Authenticates and connects to the database.       |

---

## Usage Recommendations

- Always call `connectToDatabase()` before using the `sequelize` instance.
- Use environment variables to control database configuration for different environments.
- Extend this module to define and import your Sequelize models as needed.

---