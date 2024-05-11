# PsIngestionConstants

This class contains constants used for configuring ingestion models with specific parameters related to token pricing, token limits, and request limits per minute.

## Properties

| Name                    | Type                             | Description                                       |
|-------------------------|----------------------------------|---------------------------------------------------|
| ingestionMainModel      | IEngineBaseAIModelConstants      | Constants for the main model used in ingestion.   |
| ingestionRankingModel   | IEngineBaseAIModelConstants      | Constants for the ranking model used in ingestion.|

## Example

```typescript
import { PsIngestionConstants } from '@policysynth/agents/rag/ingestion/ingestionConstants.js';

console.log(PsIngestionConstants.ingestionMainModel);
console.log(PsIngestionConstants.ingestionRankingModel);
```