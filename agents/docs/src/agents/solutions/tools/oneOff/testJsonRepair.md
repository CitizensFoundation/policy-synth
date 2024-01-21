# jsonrepair

`jsonrepair` is a utility that attempts to fix invalid JSON strings.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| jsonrepair | jsonString: string | string      | Tries to repair a JSON string by fixing common JSON errors and returns a valid JSON string. |

## Examples

```typescript
import { jsonrepair } from 'jsonrepair';

const invalidJson = `
{
  "summary": "The text "discusses" four key practices that policy makers can use to maximize their ability to generate effective policy for complex and dynamic environments like Syria.
  These practices include seeing the system in "3-D", engaging with patterns instead of problems, aligning fast and slow variables, and failing smart,
  adapting fast, and leveraging success. The ultimate goal is to produce a more peaceful Syria that improves the quality of life for all Syrians.",
  // ... rest of the JSON
}
`;

try {
  // Attempt to repair the invalid JSON string
  const repairedJson = jsonrepair(invalidJson);
  console.log('Repaired JSON:', repairedJson);
} catch (error) {
  console.error('Failed to repair JSON:', error);
}
```

Note: The provided TypeScript code snippet contains a JSON parsing attempt with error handling and a subsequent repair attempt using `jsonrepair`. However, the `jsonrepair` function is not designed to handle TypeScript-specific syntax or types, and the error handling in the snippet is not standard TypeScript code. The `process.exit` calls and the `error: any` type annotation are not typical in TypeScript API documentation.