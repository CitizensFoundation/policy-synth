# main

This function is the main entry point for exporting sub-problems of a project into a CSV file format. It retrieves project data from Redis and writes the sub-problems to a specified output file.

## Properties

| Name       | Type                         | Description                                   |
|------------|------------------------------|-----------------------------------------------|
| redis      | ioredis.Redis                | Redis client instance for database operations.|

## Methods

| Name   | Parameters                        | Return Type | Description |
|--------|-----------------------------------|-------------|-------------|
| main   | None                              | Promise<void> | Main function that handles the export of sub-problems. |

## Example

```typescript
import { main } from '@policysynth/agents/problems/tools/exportSubProblems.js';

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```