# Licence and Degree Analysis Agents

This folder contains agents that work together to research professional licensing requirements and
whether a college degree is needed for specific job titles. The workflow starts with importing job
licence types from a Google Sheet, crawls authoritative sources to extract requirement text, runs an
LLM analysis and finally exports ranked results back to a spreadsheet.

## Main Agents

- **LicenceAnalysisAgent** – Orchestrates the full process. It loads job licence data, calls the
  extractors and analyzers, saves intermediate results and triggers ranking and export.
- **LicenceDeepResearchAgent** – Performs targeted web searches to locate authoritative pages about
  licensing requirements for a given licence type.
- **AuthorativeSourceFinderAgent** – Uses `LicenceDeepResearchAgent` to discover official URLs (such
  as statutes or board pages) that describe the requirements.
- **DegreeRequirementAnalyzerAgent** – Given requirement text, determines the minimum degree status
  (explicit bachelor’s, implicit associate’s, no degree, etc.) with supporting evidence.
- **RequirementsExtractor** – Fetches remote pages (HTML, PDF, spreadsheets) and extracts raw text
  for analysis.
- **FirecrawlExtractor** – Wraps the Firecrawl service to crawl and scrape pages while filtering out
  irrelevant content.
- **RankResults** – Ranks multiple analysis results for the same licence type using pairwise Elo
  scoring to surface the most authoritative sources.

### Helper Agents

- **ImportSheet** – `SheetsLicenseDegreeImportAgent` reads rows from a configured Google Sheet and
  produces structured `LicenseDegreeRow` objects used by the main agent.
- **ExportSheet** – `SheetsLicenseDegreeExportAgent` writes analysed and ranked results back to a
  Google Sheet in chunks to avoid API limits.

These helpers contain no AI model calls – they simply move data in and out of Google Sheets.

## Collaboration Flow

1. **ImportSheet** loads licence types from the spreadsheet into memory.
2. **LicenceAnalysisAgent** iterates over each row. For every licence type it:
   - Invokes **AuthorativeSourceFinderAgent** which in turn leverages
     **LicenceDeepResearchAgent** to search the web and find official sources.
   - For each discovered URL, **FirecrawlExtractor** retrieves the content and
     **RequirementsExtractor** converts it into plain text.
   - **DegreeRequirementAnalyzerAgent** analyses the extracted text and outputs a
     JSON result describing the degree requirement status with evidence and a confidence score.
3. After all sources are analysed, **RankResults** compares the individual analysis results and ranks
   them by authoritativeness using pairwise votes.
4. Finally, **ExportSheet** writes the ranked results back to the spreadsheet for review.

Queue files exist to schedule these agents but are intentionally omitted here.

## Usage

1. **Register a Google Sheets connector.** The `runAgents.ts` script sets up
   `PsGoogleSheetsConnector` so the agents can read and write spreadsheets.
2. **Build the project** and compile the TypeScript sources:
   ```bash
   npm install
   npm run build
   ```
3. **Start the agent runner** which registers all classes and connectors:
   ```bash
   node ts-out/jobDescriptions/runAgents.js
   ```
4. **Schedule jobs** on the queue defined in
   [`licenceAnalysisQueue.ts`](licenceAnalysisQueue.ts) or enqueue them manually
   using `triggerAgentQueue.ts`.

### Optional Configuration

- **Sheet name** – Set `worksheetName` in the agent memory to read from a
  different tab than the default `Sheet1`.
- **Ranking parameters** – `rankResults.ts` uses pairwise Elo scoring. You can
  tweak the number of comparisons or weights in that file to change the ranking
  behaviour.

