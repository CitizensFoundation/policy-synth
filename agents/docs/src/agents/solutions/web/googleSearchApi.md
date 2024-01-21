# GoogleSearchApi

This class provides functionality to perform searches using the Google Custom Search API and process the results.

## Properties

No public properties are documented for this class.

## Methods

| Name    | Parameters       | Return Type                           | Description                                                                 |
|---------|------------------|---------------------------------------|-----------------------------------------------------------------------------|
| search  | query: string    | Promise<IEngineSearchResultItem[]>   | Performs a search with the given query and returns a list of search results |

## Examples

```typescript
// Example usage of GoogleSearchApi to perform a search
const googleSearchApi = new GoogleSearchApi();
googleSearchApi.search("liberal democracies: issues and solutions")
  .then(results => {
    console.log("Search results:", results);
  })
  .catch(error => {
    console.error("Search failed:", error);
  });
```