# Legal Research Agents

## Overview

This folder contains agents that find official evidence of college degree requirements for job titles. They filter analyzed job descriptions, perform targeted web searches and store the results in Google Sheets. The goal is to surface regulations or statutes that mandate a degree so that those barriers can be reviewed and, if appropriate, removed.

## Agent Descriptions

- **EducationRequirementsBarrierDeepResearchAgent** – filters job descriptions that need a college degree, locates authoritative URLs via `JobTitleAuthoritativeSourceFinderAgent`, crawls them and analyses the content with `EducationRequirementAnalyzerAgent`, then exports the findings using `SheetsEducationRequirementExportAgent`.
- **JobTitleAuthoritativeSourceFinderAgent** – uses `JobTitleDeepResearchAgent` to search for official sources about education requirements for a job title and returns the discovered URLs.
- **EducationRequirementAnalyzerAgent** – given page text, determines if the job title requires a college degree and outputs a short summary with a confidence score.
- **JobTitleDeepResearchAgent** – utility for generating targeted search queries and ranking results.
- **SheetsEducationRequirementExportAgent** – writes the aggregated research data to a Google Sheet in chunks after sanitising the values.

## Queues

- **EducationRequirementsDeepResearchQueue** – schedules
  `EducationRequirementsBarrierDeepResearchAgent` jobs using the queue name
  `EDUCATION_REQUIREMENTS_DEEP_RESEARCH`.

## Environment Variables

- `GOOGLE_SEARCH_API_KEY` – Google Custom Search API key used for web searches.
- `GOOGLE_SEARCH_API_CX_ID` – Custom Search Engine ID.
- `FIRECRAWL_API_KEY` – required for page crawling via Firecrawl.
- `MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL` – optional concurrency limit for page fetching.
- `PS_DEBUG_AI_MESSAGES` – set to `true` to log prompts and responses.

## Connector Setup

Register a `PsGoogleSheetsConnector` with your service account credentials and target spreadsheet. The `SheetsEducationRequirementExportAgent` writes its output using this connector.

## Example Usage

```ts
const researchAgent = new EducationRequirementsBarrierDeepResearchAgent(agent, memory, 0, 100);
await researchAgent.process();
```
