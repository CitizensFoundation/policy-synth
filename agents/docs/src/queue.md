# Logger Configuration

This module sets up a logger using the `winston` library and handles uncaught exceptions and unhandled promise rejections. It also imports agents for smarter crowdsourcing.

## Properties

| Name   | Type     | Description                                                                 |
|--------|----------|-----------------------------------------------------------------------------|
| logger | winston.Logger | The configured logger instance using `winston`. |

## Methods

| Name                | Parameters          | Return Type | Description                                                                 |
|---------------------|---------------------|-------------|-----------------------------------------------------------------------------|
| process.on          | event: string, listener: Function | void        | Listens for specific process events and executes the provided listener function. |

## Example

```typescript
import winston from 'winston';

import './smarterCrowdsourcing/agents/problems/problemsAgent.js'
import './smarterCrowdsourcing/agents/solutions/solutionsWebResearch.js'
import './smarterCrowdsourcing/agents/policies/policies.js'

const logger = winston.createLogger({
  level: process.env.WORKER_LOG_LEVEL || 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

process.on("uncaughtException", function (err) {
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at: Promise");
});

export { logger };
```

### Detailed Description

- **Logger Configuration**: The logger is configured using the `winston` library. The log level is set based on the `WORKER_LOG_LEVEL` environment variable, defaulting to 'debug' if not set. The log format is JSON, and logs are output to the console with colorization and a simple format.

- **Error Handling**: The module sets up listeners for `uncaughtException` and `unhandledRejection` events to log errors using the configured logger.

- **Agent Imports**: The module imports agents for smarter crowdsourcing, including problem agents, solution web research agents, and policy agents. These imports ensure that the agents are available for use within the application.

### Usage

To use the logger in other parts of your application, you can import it as follows:

```typescript
import { logger } from './path/to/logger.js';

logger.info('This is an info message');
logger.error('This is an error message');
```

This setup ensures that all logs are consistently formatted and output to the console, and that any uncaught exceptions or unhandled promise rejections are logged for debugging purposes.