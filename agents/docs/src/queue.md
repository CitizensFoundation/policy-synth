# Logger

The `Logger` class is responsible for creating a logging instance using the `winston` library. It is configured to log messages at a level specified by the `WORKER_LOG_LEVEL` environment variable or defaults to 'debug' if not specified. The logger outputs in JSON format and logs to the console with colorized and simple formatting.

## Properties

No properties are documented for the `Logger` class as it is a configuration setup for the `winston` logger.

## Methods

No methods are documented for the `Logger` class as it primarily serves as a configuration setup for the `winston` logger.

## Examples

```typescript
// Example usage of the logger
import { logger } from './path-to-logger-file';

logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error message');
```

Note: Replace `'./path-to-logger-file'` with the actual path to the file where the `logger` is exported.