# PsConstants

This class encapsulates constants and configurations used across various AI models for engine operations. It includes settings for AI model parameters such as temperature, token limits, cost per token, and rate limits for transactions and requests per minute. Additionally, it contains utility methods for simplifying evidence and root cause types.

## Properties

| Name                                           | Type    | Description |
|------------------------------------------------|---------|-------------|
| gpt4InTokenPrice                               | number  | The cost per input token for GPT-4. |
| gpt4OutTokenPrice                              | number  | The cost per output token for GPT-4. |
| gpt35_16kInTokenPrice                          | number  | The cost per input token for GPT-3.5 on 16k models. |
| gpt35_16kOutTokenPrice                         | number  | The cost per output token for GPT-3.5 on 16k models. |
| gpt4TotalTokenLimit                            | number  | The total token limit for GPT-4 models. |
| adaInTokenPrice                                | number  | The cost per input token for Ada models. |
| gpt35_16k_TPM                                  | number  | Transactions per minute limit for GPT-3.5 on 16k models. |
| gpt35_16k_RPM                                  | number  | Requests per minute limit for GPT-3.5 on 16k models. |
| gpt35_TPM                                      | number  | Transactions per minute limit for GPT-3.5 models. |
| gpt35_RPM                                      | number  | Requests per minute limit for GPT-3.5 models. |
| gpt4_TPM                                       | number  | Transactions per minute limit for GPT-4 models. |
| gpt4_RPM                                       | number  | Requests per minute limit for GPT-4 models. |
| createSubProblemsModel                         | PsBaseAIModelConstants | Configuration for the AI model used in creating sub-problems. |
| policiesSeedModel                              | PsBaseAIModelConstants | Configuration for the AI model used in seeding policies. |
| analyseExternalSolutionsModel                  | PsBaseAIModelConstants | Configuration for the AI model used in analyzing external solutions. |
| createEntitiesModel                            | PsBaseAIModelConstants | Configuration for the AI model used in creating entities. |
| topicMapSolutionsModel                         | object  | Configuration related to topic mapping solutions. |
| createSolutionImagesModel                      | PsBaseAIModelConstants | Configuration for the AI model used in creating solution images. |
| createSearchQueriesModel                       | PsBaseAIModelConstants | Configuration for the AI model used in creating search queries. |
| createEvidenceSearchQueriesModel               | PsBaseAIModelConstants | Configuration for the AI model used in creating evidence search queries. |
| createRootCauseSearchQueriesModel              | PsBaseAIModelConstants | Configuration for the AI model used in creating root cause search queries. |
| searchQueryRankingsModel                       | PsBaseAIModelConstants | Configuration for the AI model used in ranking search queries. |
| searchResultsRankingsModel                     | PsBaseAIModelConstants | Configuration for the AI model used in ranking search results. |
| subProblemsRankingsModel                       | PsBaseAIModelConstants | Configuration for the AI model used in ranking sub-problems. |
| entitiesRankingsModel                          | PsBaseAIModelConstants | Configuration for the AI model used in ranking entities. |
| solutionsRankingsModel                         | PsBaseAIModelConstants | Configuration for the AI model used in ranking solutions. |
| prosConsRankingsModel                          | PsBaseAIModelConstants | Configuration for the AI model used in ranking pros and cons. |
| getPageAnalysisModel                           | PsBaseAIModelConstants | Configuration for the AI model used in page analysis. |
| getSolutionsPagesAnalysisModel                 | PsBaseAIModelConstants | Configuration for the AI model used in analyzing solutions pages. |
| rankWebSolutionsModel                          | PsBaseAIModelConstants | Configuration for the AI model used in ranking web solutions. |
| reduceSubProblemsModel                         | PsBaseAIModelConstants | Configuration for the AI model used in reducing sub-problems. |
| rateWebEvidenceModel                           | PsBaseAIModelConstants | Configuration for the AI model used in rating web evidence. |
| rateWebRootCausesModel                         | PsBaseAIModelConstants | Configuration for the AI model used in rating web root causes. |
| rankWebEvidenceModel                           | PsBaseAIModelConstants | Configuration for the AI model used in ranking web evidence. |
| rankWebRootCausesModel                         | PsBaseAIModelConstants | Configuration for the AI model used in ranking web root causes. |
| getRefinedEvidenceModel                        | PsBaseAIModelConstants | Configuration for the AI model used in refining evidence. |
| getRefinedRootCausesModel                      | PsBaseAIModelConstants | Configuration for the AI model used in refining root causes. |
| reapSolutionsModel                             | PsBaseAIModelConstants | Configuration for the AI model used in reaping solutions. |
| groupSolutionsModel                            | PsBaseAIModelConstants | Configuration for the AI model used in grouping solutions. |
| rateSolutionsModel                             | PsBaseAIModelConstants | Configuration for the AI model used in rating solutions. |
| createSolutionsModel                           | PsBaseAIModelConstants | Configuration for the AI model used in creating solutions. |
| evolveSolutionsModel                           | PsBaseAIModelConstants | Configuration for the AI model used in evolving solutions. |
| createProsConsModel                            | PsBaseAIModelConstants | Configuration for the AI model used in creating pros and cons. |
| evolutionMutateModel                           | PsBaseAIModelConstants | Configuration for the AI model used in mutation during evolution. |
| evolutionRecombineModel                        | PsBaseAIModelConstants | Configuration for the AI model used in recombination during evolution. |
| validationModel                                | PsBaseAIModelConstants | Configuration for the AI model used in validation. |
| getPageCacheExpiration                         | number  | The expiration time for page cache in seconds. |
| maxSubProblems                                 | number  | The maximum number of sub-problems. |
| maxNumberGeneratedOfEntities                   | number  | The maximum number of entities generated. |
| maxStabilityRetryCount                         | number  | The maximum number of retries for stability. |
| mainLLMmaxRetryCount                           | number  | The maximum number of retries for the main LLM. |
| limitedLLMmaxRetryCount                        | number  | The maximum number of retries for the limited LLM. |
| rankingLLMmaxRetryCount                        | number  | The maximum number of retries for the ranking LLM. |
| maxTopEntitiesToSearch                         | number  | The maximum number of top entities to search. |
| maxTopEntitiesToRender                         | number  | The maximum number of top entities to render. |
| maxTopQueriesToSearchPerType                   | number  | The maximum number of top queries to search per type. |
| maxTopEvidenceQueriesToSearchPerType           | number  | The maximum number of top evidence queries to search per type. |
| maxTopRootCauseQueriesToSearchPerType          | number  | The maximum number of top root cause queries to search per type. |
| maxRootCausePercentOfSearchResultWebPagesToGet | number  | The maximum percentage of search result web pages to get for root causes. |
| maxRootCausesToUseForRatingRootCauses          | number  | The maximum number of root causes to use for rating. |
| topWebPagesToGetForRefineRootCausesScan        | number  | The number of top web pages to get for refining root causes scan. |
| mainSearchRetryCount                           | number  | The maximum number of retries for the main search. |
| maxDalleRetryCount                             | number  | The maximum number of retries for DALL·E. |
| maxTopWebPagesToGet                            | number  | The maximum number of top web pages to get. |
| maxBingSearchResults                           | number  | The maximum number of Bing search results. |
| maxTopProsConsUsedForRating                    | number  | The maximum number of top pros and cons used for rating. |
| maxNumberGeneratedProsConsForSolution          | number  | The maximum number of generated pros and cons for a solution. |
| minSleepBeforeBrowserRequest                   | number  | The minimum sleep time before a browser request in milliseconds. |
| maxAdditionalRandomSleepBeforeBrowserRequest   | number  | The maximum additional random sleep time before a browser request in milliseconds. |
| numberOfSearchTypes                            | number  | The number of search types. |
| webPageNavTimeout                              | number  | The web page navigation timeout in milliseconds. |
| subProblemsRankingMinNumberOfMatches           | number  | The minimum number of matches for sub-problems ranking. |
| currentUserAgent                               | string  | The current user agent string. |
| topItemsToKeepForTopicClusterPruning           | number  | The number of top items to keep for topic cluster pruning. |
| chances                                        | object  | Configuration for various probabilities used in solution creation. |
| maxTopSearchQueriesForSolutionCreation         | number  | The maximum number of top search queries for solution creation. |
| maxPercentOfSolutionsWebPagesToGet             | number  | The maximum percentage of solutions web pages to get. |
| limits                                         | object  | Configuration for various limits used in solution creation. |
| enable                                         | object  | Configuration for enabling various refinement processes. |
| evolution                                      | object  | Configuration for the evolution process. |
| maxPercentOfEloMatched                         | number  | The maximum percentage of ELO matched. |
| minimumNumberOfPairwiseVotesForPopulation      | number  | The minimum number of pairwise votes for the population. |
| maxNumberOfPairwiseRankingPrompts              | number  | The maximum number of pairwise ranking prompts. |
| maxTopSolutionsToCreatePolicies                | number  | The maximum number of top solutions to create policies. |
| maxTopPoliciesToProcess                        | number  | The maximum number of top policies to process. |
| maxEvidenceToUseForRatingEvidence              | number  | The maximum evidence to use for rating evidence. |
| policyEvidenceFieldTypes                       | string[] | The field types for policy evidence. |
| rootCauseFieldTypes                            | string[] | The field types for root causes. |

## Methods

| Name                     | Parameters                  | Return Type | Description |
|--------------------------|-----------------------------|-------------|-------------|
| simplifyEvidenceType     | evidenceType: string        | string      | Simplifies the evidence type string by removing prefixes and suffixes, and converting to camel case. |
| simplifyRootCauseType    | rootCauseType: string       | string      | Simplifies the root cause type string by removing prefixes and suffixes, converting to camel case, and ensuring singular form except for specific cases. |

## Example

```typescript
import { PsConstants } from '@policysynth/webapp/constants.js';

// Example usage of PsConstants
const modelConfig = PsConstants.createSubProblemsModel;
console.log(modelConfig.name); // Output: gpt-4-1106-preview

// Simplifying evidence type
const simplifiedEvidenceType = PsConstants.simplifyEvidenceType("allPossibleScientificEvidenceIdentifiedInTextContext");
console.log(simplifiedEvidenceType); // Output: scientificEvidence

// Simplifying root cause type
const simplifiedRootCauseType = PsConstants.simplifyRootCauseType("allPossibleEconomicRootCausesIdentifiedInTextContext");
console.log(simplifiedRootCauseType); // Output: economicRootCause
```