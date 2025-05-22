# Job Description Agents

## Overview

This folder contains a collection of agents used to analyze, rewrite and export job descriptions. The workflow identifies education requirements, performs deep research and exports the results to Google Sheets or Docs. It also includes utilities for rewriting job descriptions to roughly a 10th‑grade reading level.

## Agent Descriptions

- **JobDescriptionAnalysisAgent** – orchestrates the overall analysis workflow. It calls the review agents and triggers multi‑level handling when necessary.
- **JobDescriptionRewriterAgent** – rewrites descriptions and exports pairs of original/revised text. `JobDescriptionRewriterQueue` schedules this work.
- **JobDescriptionMultiLevelAnalysisAgent** – processes job descriptions that contain multiple job levels by splitting and re‑running the analysis chain.

### Review agents (`reviewAgents/`)

- `DetermineCollegeDegreeStatusAgent`
- `DetermineProfessionalLicenseRequirementAgent`
- `DetermineMandatoryStatusAgent`
- `IdentifyBarriersAgent`
- `ValidateJobDescriptionAgent`
- `ReadabilityFleshKncaidJobDescriptionAgent`
- `ReadingLevelAnalysisAgent`

These sub‑agents examine degree requirements, licensing, barriers and readability for each job description.

### Deep research utilities (`deepResearch/`)

Agents for search query generation, ranking, web page scanning and content ranking. They help gather evidence from the web when analyzing job descriptions.

### Rewriting helpers (`rewriting/`)

Utility agents for difference analysis, bucketing similar jobs, running parallel checks and exporting rewritten documents.

### License‑degree analysis (`licenceDegrees/`)

Agents that research and analyze licensing and degree requirements, with Google Sheets import/export helpers.

### Import/Export agents

- `imports/` – `SheetsJobDescriptionImportAgent` for loading descriptions from Google Sheets.
- `exports/` – `SheetsJobDescriptionExportAgent` for pushing analysis results to Sheets.
- `evals/` – `SheetsComparisonAgent` compares connector outputs.

## Queues and Runner

- **JobDescriptionAnalysisQueue** schedules the main analysis agent.
- **JobDescriptionRewriterQueue** schedules rewriting tasks.
- **JobTitleLicenseDegreeAnalysisQueue** handles the licence‑degree agents.
- `runAgents.ts` registers all agent classes and connectors, then starts the runner.

## Usage

1. Install dependencies and build the project:
   ```bash
   npm install
   npm run build
   ```
2. Run the agent runner (after compilation):
   ```bash
   node ts-out/jobDescriptions/runAgents.js
   ```
3. Optionally trigger a queue manually:
   ```bash
   node ts-out/jobDescriptions/triggerAgentQueue.js
   ```

## Directory Reference

| Path | Purpose |
| --- | --- |
| `analysisAgent.ts` | Main controller for job description analysis |
| `analysisAgentQueue.ts` | BullMQ queue for the analysis agent |
| `rewriterAgent.ts` | Rewrites job descriptions |
| `rewriteAgentQueue.ts` | Queue used by the rewriter agent |
| `multiLevel/` | Agents for multi‑level job descriptions |
| `reviewAgents/` | Degree, license and readability checks |
| `deepResearch/` | Web search and ranking utilities |
| `rewriting/` | Rewriting helper agents |
| `licenceDegrees/` | Licence and degree analysis agents |
| `imports/` | Google Sheets import helper |
| `exports/` | Google Sheets export helper |
| `evals/` | Evaluation agents (e.g., sheet comparison) |
| `runAgents.ts` | Registers agents and connectors |
| `triggerAgentQueue.ts` | Sample script to enqueue a job |


