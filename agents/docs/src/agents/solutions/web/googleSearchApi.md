# GoogleSearchApi

The `GoogleSearchApi` class extends the `PolicySynthAgentBase` class and provides functionality to perform searches using the Google Custom Search API. It communicates with the Google API, processes the results, and returns them in a structured format.

## Properties

No public properties are documented for this class.

## Methods

| Name    | Parameters       | Return Type                         | Description                                                                 |
|---------|------------------|-------------------------------------|-----------------------------------------------------------------------------|
| search  | query: string    | Promise<IEngineSearchResultItem[]> | Performs a search using the Google Custom Search API and returns the results. |

## Examples

```typescript
// Example usage of the GoogleSearchApi class
const googleSearchApi = new GoogleSearchApi();
try {
  const results = await googleSearchApi.search("liberal democracies: issues and solutions");
  console.log("Search results:", results);
} catch (error) {
  console.error("Test failed:", error);
}
```