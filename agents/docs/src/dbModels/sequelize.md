# Sequelize Database Connection

This module sets up and manages the connection to a PostgreSQL database using Sequelize. It includes configurations for both production and non-production environments, with options for SSL and custom logging.

## Properties

| Name       | Type       | Description                                      |
|------------|------------|--------------------------------------------------|
| sequelize  | Sequelize  | The Sequelize instance configured for the database connection. |

## Methods

| Name              | Parameters | Return Type | Description                                      |
|-------------------|------------|-------------|--------------------------------------------------|
| connectToDatabase | None       | Promise<void> | Authenticates and synchronizes the Sequelize models with the database. |

## Example

```typescript
import { sequelize, connectToDatabase } from '@policysynth/agents/dbModels/sequelize.js';

(async () => {
  await connectToDatabase();
  // Your code here
})();
```

## Detailed Description

### Properties

#### `sequelize`

The `sequelize` instance is configured based on the environment (production or development). It uses different configurations for SSL and logging based on the environment.

### Methods

#### `connectToDatabase`

This method authenticates the Sequelize instance with the database and synchronizes all models. If the connection fails, it logs the error and exits the process.

### Configuration

The module uses environment variables to configure the database connection. For non-production environments, it can also fall back to a configuration file if specific environment variables are not set.

- **Environment Variables:**
  - `NODE_ENV`: The environment (e.g., "development" or "production").
  - `DATABASE_URL`: The database URL for production environments.
  - `DISABLE_PG_SSL`: Disable SSL for PostgreSQL in production.
  - `PSQL_DB_NAME`, `PSQL_DB_USER`, `PSQL_DB_PASS`, `DB_HOST`, `DB_PORT`: Individual database connection parameters for non-production environments.

- **Configuration File:**
  - The module can fall back to a configuration file located at `../../../ts-out/config/config.json` if the `PSQL_DB_NAME` environment variable is not set.

### Logging

Custom logging is implemented using the `logQuery` function, which logs the query, bind parameters, and the current date and time. This is enabled for non-production environments.

### SSL Configuration

For production environments, SSL is enabled by default unless the `DISABLE_PG_SSL` environment variable is set. For non-production environments, SSL is disabled by default but can be configured through the `dialectOptions`.

### Example Usage

```typescript
import { sequelize, connectToDatabase } from '@policysynth/agents/dbModels/sequelize.js';

(async () => {
  await connectToDatabase();
  // Your code here
})();
```

This example demonstrates how to import and use the `sequelize` instance and `connectToDatabase` method to establish a connection to the database and synchronize models.