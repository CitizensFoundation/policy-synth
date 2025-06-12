# Evaluation Agents

This directory contains agents used to validate and compare job-description analysis results against spreadsheet data.

## SheetsComparisonAgent
The `SheetsComparisonAgent` imports job descriptions from all spreadsheet connectors and compares key fields with the versions already stored in memory. For each mismatch it asks a language model which connector holds the correct value and records the explanation. This highlights inconsistencies across different data sources.

## CompareLicenseEducationAgent
`CompareLicenseEducationAgent` reads professional license requirements from two separate sheets. It uses a language model to match each license type from the first sheet with the best entry from the second sheet and writes the results to an output sheet. This helps verify education requirements between datasets.

## Queues
`compareAgentQueue.ts` and `compareLicenseEducationQueue.ts` merely define BullMQ queues that run the evaluation agents. They do not implement comparison logic and can be ignored when reviewing the agents themselves.

## Running the Queues

1. Build the **projects/skillsFirst/agents** package:

   ```bash
   npm install
   npm run build
   ```

2. Start the agent runner which registers the evaluation queues:

   ```bash
   node ts-out/jobDescriptions/runAgents.js
   ```

3. Enqueue a job for either queue using BullMQ. You can adapt
   `triggerAgentQueue.ts` by changing the queue name to
   `JOB_DESCRIPTION_COMPARE_SHEETS` or `COMPARE_LICENSE_EDUCATION`.

The **SheetsComparisonAgent** prints a table of mismatched fields and the
chosen connector directly to the console. The
**CompareLicenseEducationAgent** writes its results to the `Comparison` sheet of
the configured output spreadsheet. Results are also stored in memory under
`memory.results` while the agent runs.

Refer back to the [job description agents README](../README.md) as well as the
[imports](../imports/README.md) and [exports](../exports/README.md)
documentation for details on the agents and connectors these evaluation queues
rely on.
