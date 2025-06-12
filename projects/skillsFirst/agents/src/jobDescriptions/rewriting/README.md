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

## Enabling Parallel Checks

`ParallelCheckAgents` is disabled by default inside `JobDescriptionRewriterMasterAgent`.
To run the validation step set `doParallelCheck` to `true` in `rewriterMasterAgent.ts`
before starting the queue.

Below is a simplified example of the queue definition:

```ts
import { PolicySynthAgentQueue } from "@policysynth/agents/base/agentQueue.js";
import { JobDescriptionRewriterAgent } from "./rewriterAgent.js";

export class JobDescriptionRewriterQueue extends PolicySynthAgentQueue {
  get agentQueueName(): string {
    return "JOB_DESCRIPTION_REWRITING";
  }

  get processors() {
    return [{ processor: JobDescriptionRewriterAgent, weight: 100 }];
  }
}
```

### Environment variables

The following variables influence the rewriting pipeline:

- `REDIS_AGENT_URL` – Redis connection string used by the queues.
- `MAX_WEBRESEARCH_URLS_TO_FETCH_PARALLEL` – controls how many pages the
  `WebPageScanner` fetches concurrently.
- `PS_DEBUG_AI_MESSAGES` – when set, logs the prompts sent to the AI model.
- `FIRECRAWL_API_KEY` – API key required for Firecrawl based extraction.
