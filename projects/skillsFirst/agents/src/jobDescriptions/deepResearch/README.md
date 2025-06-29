# Deep Research Agents

This folder contains helper agents used by job description workflows to gather and rank web research results. `BaseDeepResearchAgent` orchestrates several sub‑agents that generate search queries, collect pages and score the findings. These helpers are also reused in the [legal research agents](../legalResearch/README.md).

## BaseDeepResearchAgent

An abstract controller that extends `PolicySynthAgent`. It exposes `doWebResearch()` which runs the following steps:

1. **SearchQueriesGenerator** – creates a list of search queries from the research plan and instructions.
2. **SearchQueriesRanker** – pairwise ranks those queries to pick the most relevant ones.
3. **SearchWeb** – executes the top queries via Google Search and returns raw results.
4. **SearchResultsRanker** – ranks search results to surface the best pages.
5. **WebPageScanner** – fetches each page, converts the content to text and performs an AI analysis of the page.
6. **WebPageContentRanker** – ranks the analysed page content and returns the top items.

Optional deduplication utilities (e.g. `DeduplicationByKeysAgent`) are used when scanning organisations and logos.

## Sub‑agents

### SearchQueriesGenerator
Generates high quality search queries based on a license type, research plan and user instructions. It uses large language models to output a JSON array of search terms.

#### Override Example

```ts
class CustomGenerator extends SearchQueriesGenerator {
  async renderMessages() {
    return [
      this.createSystemMessage('Use domain specific keywords only.'),
      this.createHumanMessage(this.userPrompt),
    ];
  }
}

const generator = new CustomGenerator(
  agent,
  memory,
  5,
  instructions,
  0,
  30,
  licenseType
);
const queries = await generator.generateSearchQueries();
```

### SearchQueriesRanker
Uses pairwise ranking to order search queries by relevance. Only the best subset is passed to the web search stage.

### SearchResultsRanker
Ranks Google search results. A small or medium model can be selected depending on `useSmallModelForSearchResultsRanking`.

### WebPageScanner
Retrieves each URL with Puppeteer and performs deep scanning of the text. The environment variable `MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL` controls the maximum number of pages fetched concurrently. Set `PS_DEBUG_AI_MESSAGES` to log the AI prompts used during scanning.

### WebPageContentRanker
Pairwise ranks the structured page content generated by the scanner to identify the most relevant information.

### SearchWeb
Wrapper around `BaseSearchWebAgent` that performs Google searches and returns search result objects.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL` | Maximum number of web pages fetched concurrently when scanning URLs. |
| `PS_DEBUG_AI_MESSAGES` | If set, logs the AI prompts and responses used during scanning. |

## Workflow

When `BaseDeepResearchAgent.doWebResearch()` is called, the agents above run in sequence. Queries are generated and ranked, search results are fetched and ordered, pages are scanned and finally the content is ranked. The resulting array contains the highest scoring web research items for the given license type or job description.

## Building

Run the build script from `projects/skillsFirst/agents` to compile the TypeScript sources:

```bash
npm run build
```
