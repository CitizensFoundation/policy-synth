# Sequelize Database Connection Utility

This module provides a configured Sequelize instance for connecting to a PostgreSQL database, with environment-aware settings for production and development. It also exports a utility function to establish and verify the database connection.

**File:** `@policysynth/agents/dbModels/sequelize.js`

---

## Properties

| Name        | Type         | Description                                                                                 |
|-------------|--------------|---------------------------------------------------------------------------------------------|
| sequelize   | Sequelize    | The configured Sequelize instance for database operations.                                   |

---

## Functions

| Name                | Parameters | Return Type | Description                                                                                      |
|---------------------|------------|-------------|--------------------------------------------------------------------------------------------------|
| connectToDatabase   | none       | Promise<void> | Authenticates and verifies the connection to the database. Logs success or exits on failure.      |

---

## Details

### Environment-Aware Configuration

- **Production**:  
  - Uses `process.env.DATABASE_URL` for connection.
  - Optionally disables SSL if `DISABLE_PG_SSL` is set.
  - Enables SQL logging if `PS_LOG_SQL` is `"true"`.
  - Sets `minifyAliases` and disables operator aliases for security.
- **Development**:  
  - Uses individual environment variables (`PSQL_DB_NAME`, `PSQL_DB_USER`, etc.) or `YP_DEV_DATABASE_NAME` and related variables.
  - Defaults to `localhost` and disables SSL.
  - Enables SQL logging if `PS_LOG_SQL` is `"true"`.
  - Logs an error if no database configuration is found.

### Logging

- Uses the `PolicySynthAgentBase.logger` for logging connection attempts, queries, and errors.
- SQL queries are optionally logged with colored output using the `colors` package.

### Error Handling

- If authentication fails, logs the error and exits the process with a non-zero status.

---

## Example

```typescript
import { sequelize, connectToDatabase } from '@policysynth/agents/dbModels/sequelize.js';

(async () => {
  await connectToDatabase();

  // Now you can use sequelize to define models, run queries, etc.
  // Example: await sequelize.query('SELECT 1+1 AS result');
})();
```

---

## Usage Notes

- Always call `connectToDatabase()` before performing any database operations to ensure the connection is established.
- The exported `sequelize` instance should be used to define and interact with your models throughout your application.
- SQL logging can be enabled or disabled via the `PS_LOG_SQL` environment variable.
- For production, ensure your `DATABASE_URL` is set and SSL is configured as needed.

---

## Environment Variables

- `NODE_ENV`: Determines if the environment is `"production"` or not.
- `DATABASE_URL`: The full database connection string (used in production).
- `DISABLE_PG_SSL`: If set, disables SSL in production.
- `PS_LOG_SQL`: If set to `"true"`, enables SQL query logging.
- `PSQL_DB_NAME`, `PSQL_DB_USER`, `PSQL_DB_PASS`, `DB_HOST`, `DB_PORT`: Used for development database configuration.
- `YP_DEV_DATABASE_NAME`, `YP_DEV_DATABASE_USERNAME`, `YP_DEV_DATABASE_PASSWORD`: Alternative development database configuration.

---

## Dependencies

- [sequelize](https://sequelize.org/)
- [pg](https://www.npmjs.com/package/pg)
- [colors](https://www.npmjs.com/package/colors)
- [lodash](https://lodash.com/)
- [path](https://nodejs.org/api/path.html)
- [url](https://nodejs.org/api/url.html)

---

## Summary

This module centralizes the database connection logic for PolicySynth agents, ensuring consistent and secure configuration across environments. Use the exported `sequelize` instance for all ORM operations and call `connectToDatabase()` at application startup to verify connectivity.