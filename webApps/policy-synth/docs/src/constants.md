# IEngineConstants

This class contains constants and configurations for various AI models and operational parameters used within an engine.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| gpt4InTokenPrice  | number | Price per 1000 input tokens for GPT-4. |
| gpt4OutTokenPrice | number | Price per 1000 output tokens for GPT-4. |
| gpt35_16kInTokenPrice | number | Price per 1000 input tokens for GPT-3.5 16k model. |
| gpt35_16kOutTokenPrice | number | Price per 1000 output tokens for GPT-3.5 16k model. |
| gpt35InTokenPrice | number | Price per 1000 input tokens for GPT-3.5 model. |
| adaInTokenPrice | number | Price per token for Ada model. |
| gpt35kOutTokenPrice | number | Price per 1000 output tokens for GPT-3.5k model. |
| gpt35_16k_TPM | number | Tokens per minute limit for GPT-3.5 16k model. |
| gpt35_16k_RPM | number | Requests per minute limit for GPT-3.5 16k model. |
| gpt35_TPM | number | Tokens per minute limit for GPT-3.5 model. |
| gpt35_RPM | number | Requests per minute limit for GPT-3.5 model. |
| gpt4_TPM | number | Tokens per minute limit for GPT-4 model. |
| gpt4_RPM | number | Requests per minute limit for GPT-4 model. |
| getPageCacheExpiration | number | Cache expiration time for pages in seconds. |
| maxSubProblems | number | Maximum number of sub-problems allowed. |
| maxNumberGeneratedOfEntities | number | Maximum number of entities that can be generated. |
| maxStabilityRetryCount | number | Maximum number of retries for stability. |
| mainLLMmaxRetryCount | number | Maximum number of retries for the main LLM. |
| limitedLLMmaxRetryCount | number | Maximum number of retries for the limited LLM. |
| rankingLLMmaxRetryCount | number | Maximum number of retries for the ranking LLM. |
| maxTopEntitiesToSearch | number | Maximum number of top entities to search. |
| maxTopEntitiesToRender | number | Maximum number of top entities to render. |
| maxTopQueriesToSearchPerType | number | Maximum number of top queries to search per type. |
| maxTopEvidenceQueriesToSearchPerType | number | Maximum number of top evidence queries to search per type. |
| mainSearchRetryCount | number | Maximum number of retries for the main search. |
| maxDalleRetryCount | number | Maximum number of retries for DALL-E. |
| maxTopWebPagesToGet | number | Maximum number of top web pages to retrieve. |
| maxWebPagesToGetByTopSearchPosition | number | Maximum number of web pages to get by top search position. |
| maxEvidenceWebPagesToGetByTopSearchPosition | number | Maximum number of evidence web pages to get by top search position. |
| maxBingSearchResults | number | Maximum number of Bing search results. |
| maxTopProsConsUsedForRating | number | Maximum number of top pros/cons used for rating. |
| maxNumberGeneratedProsConsForSolution | number | Maximum number of generated pros/cons for a solution. |
| minSleepBeforeBrowserRequest | number | Minimum sleep time in milliseconds before a browser request. |
| maxAdditionalRandomSleepBeforeBrowserRequest | number | Maximum additional random sleep time in milliseconds before a browser request. |
| numberOfSearchTypes | number | Number of search types. |
| webPageNavTimeout | number | Web page navigation timeout in milliseconds. |
| currentUserAgent | string | Current user agent string for web requests. |
| topItemsToKeepForTopicClusterPruning | number | Number of top items to keep for topic cluster pruning. |
| maxTopSearchQueriesForSolutionCreation | number | Maximum number of top search queries for solution creation. |
| maxPercentOfEloMatched | number | Maximum percentage of ELO matched. |
| minimumNumberOfPairwiseVotesForPopulation | number | Minimum number of pairwise votes for population. |
| maxNumberOfPairwiseRankingPrompts | number | Maximum number of pairwise ranking prompts. |
| maxTopSolutionsToCreatePolicies | number | Maximum number of top solutions to create policies. |
| maxTopPoliciesToProcess | number | Maximum number of top policies to process. |
| maxEvidenceToUseForRatingEvidence | number | Maximum evidence to use for rating evidence. |
| policyEvidenceFieldTypes | string[] | Array of policy evidence field types. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| simplifyEvidenceType | evidenceType: string | string | Simplifies the evidence type string by removing certain prefixes and suffixes, and adjusting the case. |

## Examples

```typescript
// Example usage of simplifying an evidence type
const simplifiedType = IEngineConstants.simplifyEvidenceType("allPossiblePositiveEvidenceIdentifiedInTextContext");
console.log(simplifiedType); // Outputs: "positiveEvidence"
```

Note: The provided TypeScript code defines a class with static properties and a static method. The properties are constants used for various configurations, and the method `simplifyEvidenceType` is used to process evidence type strings. The class does not include any events or non-static members.