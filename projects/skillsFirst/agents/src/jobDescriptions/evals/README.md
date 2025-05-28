# Evaluation Agents

This directory contains agents used to validate and compare job-description analysis results against spreadsheet data.

## SheetsComparisonAgent
The `SheetsComparisonAgent` imports job descriptions from all spreadsheet connectors and compares key fields with the versions already stored in memory. For each mismatch it asks a language model which connector holds the correct value and records the explanation. This highlights inconsistencies across different data sources.

## CompareLicenseEducationAgent
`CompareLicenseEducationAgent` reads professional license requirements from two separate sheets. It uses a language model to match each license type from the first sheet with the best entry from the second sheet and writes the results to an output sheet. This helps verify education requirements between datasets.

## Queues
`compareAgentQueue.ts` and `compareLicenseEducationQueue.ts` merely define BullMQ queues that run the evaluation agents. They do not implement comparison logic and can be ignored when reviewing the agents themselves.
