# Job Description Agents

## Overview

This folder contains a collection of agents used to analyze, rewrite and export job descriptions. The workflow identifies education requirements, performs deep research and exports the results to Google Sheets or Docs. It also includes utilities for rewriting job descriptions to roughly a 10th‑grade reading level.

### Prerequisites

Set the following environment variables before running the agents:

- `YP_USER_ID_FOR_AGENT_CREATION` – numeric ID of the user that owns created agents and connectors.
- `OPENAI_API_KEY` – API key used for language‑model calls.
- `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_API_CX_ID` – credentials for Google Custom Search.
- `AZURE_BING_SEARCH_KEY` – optional Bing search key for web research.
- `FIRECRAWL_API_KEY` – optional key for deep web crawling.

For Google Sheets, Docs and Drive connectors create a service account and store the JSON credentials and spreadsheet ID in each connector's configuration.

## Agent Descriptions

- **JobDescriptionAnalysisAgent** – orchestrates the overall analysis workflow. It calls the review agents and triggers multi‑level handling when necessary.
- **JobDescriptionRewriterAgent** – rewrites descriptions and exports pairs of original/revised text. `JobDescriptionRewriterQueue` schedules this work.
- **JobDescriptionMultiLevelAnalysisAgent** – processes job descriptions that contain multiple job levels by splitting and re‑running the analysis chain.

### Review agents ([`reviewAgents/`](reviewAgents/README.md))

- `DetermineCollegeDegreeStatusAgent`
- `DetermineProfessionalLicenseRequirementAgent`
- `DetermineMandatoryStatusAgent`
- `IdentifyBarriersAgent`
- `ValidateJobDescriptionAgent`
- `ReadabilityFleshKncaidJobDescriptionAgent`
- `ReadingLevelAnalysisAgent`

These sub‑agents examine degree requirements, licensing, barriers and readability for each job description.

#### Expected Outputs and Memory Keys

Each review agent writes its results back to the job description stored in
`JobDescriptionMemoryData.jobDescriptions`.

- **DetermineCollegeDegreeStatusAgent** – populates
  `jobDescription.degreeAnalysis` with fields like:
  ```json
  {
    "needsCollegeDegree": true,
    "maximumDegreeRequirement": "EducationType.BachelorsDegree",
    "includesMultipleJobLevelsWithDifferentEducationalRequirements": false,
    "educationRequirements": [{
      "type": "EducationType.BachelorsDegree",
      "evidenceQuote": "..."
    }]
  }
  ```
- **DetermineMandatoryStatusAgent** – sets
  `jobDescription.degreeAnalysis.degreeRequirementStatus` and
  `mandatoryStatusExplanations`:
  ```json
  {
    "isDegreeMandatory": false,
    "hasAlternativeQualifications": true,
    "alternativeQualifications": ["five years experience"],
    "multipleQualificationPaths": true,
    "isDegreeAbsolutelyRequired": false,
    "substitutionPossible": true
  }
  ```
- **DetermineProfessionalLicenseRequirementAgent** – writes to
  `jobDescription.degreeAnalysis.professionalLicenseRequirement`:
  ```json
  {
    "isLicenseRequired": true,
    "licenseDescription": "State teaching certificate",
    "issuingAuthority": "State Board",
    "includesDegreeRequirement": true,
    "licenseType": "Teaching License"
  }
  ```
- **IdentifyBarriersAgent** – stores a plain text summary in
  `jobDescription.degreeAnalysis.barriersToNonDegreeApplicants`.
- **ValidateJobDescriptionAgent** – fills
  `jobDescription.degreeAnalysis.validationChecks` with pass/fail results, e.g.:
  ```json
  {
    "cscRevisedConsistency": "pass",
    "requiredAlternativeExplanationConsistency": "fail"
  }
  ```
- **ReadabilityFleshKncaidJobDescriptionAgent** – records the Flesch‑Kincaid
  grade under `jobDescription.readabilityAnalysisTextTSNPM`:
  ```json
  { "fleschKincaidGrade": 10.2 }
  ```
- **ReadingLevelAnalysisAgent** – saves difficult passages and the estimated
  reading level in `jobDescription.readingLevelGradeAnalysis`:
  ```json
  {
    "difficultPassages": ["..."],
    "readabilityLevel": "Bachelor’s Degree"
  }
  ```
  `ReviewEvidenceQuoteAgent` verifies evidence quotes but does not persist any
  additional memory fields.

#### Execution Order

`JobDescriptionAnalysisAgent` chains the agents in the following order for each
job description:
1. `DetermineCollegeDegreeStatusAgent`
2. `ReviewEvidenceQuoteAgent`
3. `DetermineMandatoryStatusAgent`
4. `DetermineProfessionalLicenseRequirementAgent`
5. `IdentifyBarriersAgent`
6. `ValidateJobDescriptionAgent`
7. `ReadabilityFleshKncaidJobDescriptionAgent`
8. `ReadingLevelAnalysisAgent`

After all descriptions are processed, it invokes
`JobDescriptionMultiLevelAnalysisAgent` to split multi‑level postings and finally
`SheetsJobDescriptionExportAgent` to upload the results.

### Deep research utilities ([`deepResearch/`](deepResearch/README.md))

Agents for search query generation, ranking, web page scanning and content ranking. They help gather evidence from the web when analyzing job descriptions.

### Rewriting helpers ([`rewriting/`](rewriting/README.md))

Utility agents for difference analysis, bucketing similar jobs, running parallel checks and exporting rewritten documents.

### License‑degree analysis ([`licenceDegrees/`](licenceDegrees/README.md))

Agents that research and analyze licensing and degree requirements, with Google Sheets import/export helpers.

### Import/Export agents

- `imports/` – `SheetsJobDescriptionImportAgent` for loading descriptions from Google Sheets.
- `exports/` – `SheetsJobDescriptionExportAgent` for pushing analysis results to Sheets.
- `evals/` – `SheetsComparisonAgent` compares connector outputs.
- `evals/` – `CompareLicenseEducationAgent` matches professional licence education requirements between two sheets.

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
4. Example invocation with connector registration:
   ```bash
   YP_USER_ID_FOR_AGENT_CREATION=123 OPENAI_API_KEY=sk-...
   GOOGLE_SEARCH_API_KEY=<key> GOOGLE_SEARCH_API_CX_ID=<id> \
   ts-node src/jobDescriptions/runAgents.ts
   ```

## Directory Reference

| Path | Purpose |
| --- | --- |
| `analysisAgent.ts` | Main controller for job description analysis |
| `analysisAgentQueue.ts` | BullMQ queue for the analysis agent |
| `rewriterAgent.ts` | Rewrites job descriptions |
| `rewriteAgentQueue.ts` | Queue used by the rewriter agent |
| `multiLevel/` | Agents for multi‑level job descriptions |
| [`reviewAgents/`](reviewAgents/README.md) | Degree, license and readability checks |
| [`deepResearch/`](deepResearch/README.md) | Web search and ranking utilities |
| [`rewriting/`](rewriting/README.md) | Rewriting helper agents |
| [`licenceDegrees/`](licenceDegrees/README.md) | Licence and degree analysis agents |
| `imports/` | Google Sheets import helper |
| `exports/` | Google Sheets export helper |
| `evals/` | Evaluation agents (e.g., sheet comparison) |
| `evals/compareLicenseEducationQueue.ts` | Queue for the CompareLicenseEducationAgent |
| `runAgents.ts` | Registers agents and connectors |
| `triggerAgentQueue.ts` | Sample script to enqueue a job |


