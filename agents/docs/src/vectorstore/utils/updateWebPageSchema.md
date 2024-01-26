# updateWebPageSchema

This function updates the schema for a `WebPage` class in a Weaviate instance by making an HTTP PUT request. It constructs the request URL from an environment variable or defaults to `http://localhost:8080` if the environment variable is not set. The function sends a predefined payload to update the `WebPage` schema configuration, specifically its inverted index configuration.

## Methods

| Name                | Parameters | Return Type | Description |
|---------------------|------------|-------------|-------------|
| updateWebPageSchema |            | `void`      | Asynchronously updates the `WebPage` schema in a Weaviate instance. Logs the response data or error details to the console. |

## Example

```javascript
// Example usage of updateWebPageSchema
import '@policysynth/agents/vectorstore/utils/updateWebPageSchema.js';

(async () => {
  await updateWebPageSchema();
})();
```