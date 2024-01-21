# YpServerApiBase

This class extends `YpCodeBase` and provides base functionalities for server API interactions, including methods for transforming collection types to API endpoints and wrapping fetch requests with additional error handling and offline support.

## Properties

| Name        | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| baseUrlPath | string | The base path for the API endpoints. Defaults to '/api'. |

## Methods

| Name                          | Parameters                                                                 | Return Type                  | Description                                                                                   |
|-------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| transformCollectionTypeToApi  | type: string                                                               | string                       | Static method that transforms a given collection type to its corresponding API endpoint name. |
| fetchWrapper                  | url: string, options: RequestInit, showUserError: boolean, errorId: string \| undefined, skipJsonParse: boolean | Promise\<string \| Response \| null\> | Protected method that wraps the fetch call with additional error handling and offline support. |
| handleResponse                | response: Response, showUserError: boolean, errorId: string \| undefined  | Promise\<any \| null\>       | Protected method that processes the fetch response, handling JSON parsing and error events.   |

## Examples

```typescript
// Example usage of transforming a collection type to an API endpoint
const apiEndpoint = YpServerApiBase.transformCollectionTypeToApi('user');
console.log(apiEndpoint); // Output: 'users'

// Example usage of fetchWrapper method
const serverApiBase = new YpServerApiBase();
serverApiBase.fetchWrapper('https://example.com/api/data', { method: 'GET' })
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Example usage of handleResponse method
// Note: This method is typically used internally within fetchWrapper and may not be used directly in most cases.
```

**Note:** The `fetchWrapper` and `handleResponse` methods are marked as protected and are intended to be used within the class or by subclasses. They may not be accessible from outside the class hierarchy.