# Legal Research Agents

## Overview

This folder contains agents that find official evidence of college degree requirements for job titles. They filter analyzed job descriptions, perform targeted web searches and store the results in Google Sheets. The goal is to surface regulations or statutes that mandate a degree so that those barriers can be reviewed and, if appropriate, removed.

## Agent Descriptions

- **EducationRequirementsBarrierDeepResearchAgent** – filters job descriptions that need a college degree, performs web research on each title using `JobTitleDeepResearchAgent`, then sends the results to `SheetsEducationRequirementExportAgent` for export.
- **JobTitleDeepResearchAgent** – a specialized deep‑research utility that searches official statutes or government classification documents for mandatory education requirements and returns the best matching URL.
- **SheetsEducationRequirementExportAgent** – writes the aggregated research data to a Google Sheet in chunks after sanitising the values.

## Queues

No BullMQ queues are defined in this folder.

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
