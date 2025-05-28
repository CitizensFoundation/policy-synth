# Multi-Level Job Description Agents

This directory contains helpers for job descriptions that bundle several job levels in a single document.

## Agents

- **JobDescriptionMultiLevelAnalysisAgent** – orchestrates multi‑level handling. It locates job descriptions flagged with `multiLevelJob`, splits them and re-runs the normal analysis chain.
- **SplitMultiLevelJobDescriptionAgent** – uses an LLM prompt to extract the portion of text for a specific level so that each level can be processed independently.

## Workflow

1. `JobDescriptionMultiLevelAnalysisAgent` iterates through memory and finds descriptions marked as multi‑level.
2. For each match it calls `SplitMultiLevelJobDescriptionAgent` to isolate the job text for the current title code.
3. The trimmed sub‑level description is then passed back to `JobDescriptionAnalysisAgent`, which performs the usual review steps and exports the results.
4. Each generated sub‑level entry is saved back to memory and exported to Google Sheets.

This approach allows a single multi‑level description to be broken into separate records so degree requirements, licensing checks and readability analysis run correctly for every job level.
