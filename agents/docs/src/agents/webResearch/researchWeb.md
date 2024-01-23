# ResearchWeb

The `ResearchWeb` class extends the `SearchWebProcessor` class to perform web searches based on provided search queries.

## Properties

No public properties are documented.

## Methods

| Name    | Parameters             | Return Type            | Description                                      |
|---------|------------------------|------------------------|--------------------------------------------------|
| search  | searchQueries: string[] | Promise<any[]> | Performs a web search and returns the search results. |

## Examples

```typescript
// Example usage of the ResearchWeb class
const researchWeb = new ResearchWeb();
const searchQueries = ["climate change", "renewable energy"];
researchWeb.search(searchQueries).then(results => {
  console.log(results);
});
```