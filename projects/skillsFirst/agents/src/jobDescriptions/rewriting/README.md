# Rewriting Pipeline Agents

This folder contains helper agents used by `JobDescriptionRewriterAgent` to rewrite job descriptions at roughly a 10th‑grade reading level.

## Agents

- **JobDescriptionRewriterMasterAgent** – orchestrates rewriting for a single job description. It repeatedly calls `RewriteSubAgent` and optionally `ParallelCheckAgents` until an acceptable rewrite is produced.
- **JobDescriptionBucketAgent** – groups job descriptions that failed difference analysis by occupational classification so they can be rewritten in batches.
- **DifferenceAnalysisAgent** – compares each job description's assessed reading level with its required education level and flags mismatches.
- **RewriteSubAgent** – performs the actual rewrite of a job description.
- **ParallelCheckAgents** – (optional) validates rewritten text to ensure no hallucinations and that all original details remain.
- **JobDescriptionPairExporter** – exports original and rewritten job descriptions to a Google Doc for review.

## Flow

1. **Difference analysis** – `DifferenceAnalysisAgent` tests whether the reading level matches the required degree.
2. **Bucketing** – `JobDescriptionBucketAgent` groups mismatched descriptions by occupational category.
3. **Rewriting** – for each bucket, `JobDescriptionRewriterMasterAgent` invokes `RewriteSubAgent` (and `ParallelCheckAgents` if enabled).
4. **Export** – `JobDescriptionPairExporter` writes the pairs to a Google Doc.

Queue configuration for running these agents is defined in `rewriteAgentQueue.ts` in the parent directory.
