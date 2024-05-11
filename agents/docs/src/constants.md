# IEngineConstants

This class defines constants and configurations for various AI models and operational parameters used in an engine system.

## Properties

| Name                                       | Type   | Description |
|--------------------------------------------|--------|-------------|
| gpt4InTokenPrice                           | number | Price per token for input using GPT-4 model. |
| gpt4OutTokenPrice                          | number | Price per token for output using GPT-4 model. |
| gpt35_16kInTokenPrice                      | number | Price per token for input using GPT-3.5 16k model. |
| gpt35_16kOutTokenPrice                     | number | Price per token for output using GPT-3.5 16k model. |
| gpt4TotalTokenLimit                        | number | Total token limit for GPT-4 model usage. |
| adaInTokenPrice                            | number | Price per token for input using Ada model. |
| gpt35_16k_TPM                              | number | Transactions per minute for GPT-3.5 16k model. |
| gpt35_16k_RPM                              | number | Requests per minute for GPT-3.5 16k model. |
| gpt35_TPM                                  | number | Transactions per minute for GPT-3.5 model. |
| gpt35_RPM                                  | number | Requests per minute for GPT-3.5 model. |
| gpt4_TPM                                   | number | Transactions per minute for GPT-4 model. |
| gpt4_RPM                                   | number | Requests per minute for GPT-4 model. |
| createSubProblemsModel                     | IEngineBaseAIModelConstants | Configuration for the AI model to create sub-problems. |
| policiesSeedModel                          | IEngineBaseAIModelConstants | Configuration for the AI model to seed policies. |
| analyseExternalSolutionsModel              | IEngineBaseAIModelConstants | Configuration for the AI model to analyze external solutions. |
| createEntitiesModel                        | IEngineBaseAIModelConstants | Configuration for the AI model to create entities. |
| topicMapSolutionsModel                     | object | Configuration for the AI model to map topics in solutions. |
| createSolutionImagesModel                  | IEngineBaseAIModelConstants | Configuration for the AI model to create solution images. |
| createSearchQueriesModel                   | IEngineBaseAIModelConstants | Configuration for the AI model to create search queries. |
| createEvidenceSearchQueriesModel           | IEngineBaseAIModelConstants | Configuration for the AI model to create evidence search queries. |
| createRootCauseSearchQueriesModel          | IEngineBaseAIModelConstants | Configuration for the AI model to create root cause search queries. |
| searchQueryRankingsModel                   | IEngineBaseAIModelConstants | Configuration for the AI model to rank search queries. |
| searchResultsRankingsModel                 | IEngineBaseAIModelConstants | Configuration for the AI model to rank search results. |
| subProblemsRankingsModel                   | IEngineBaseAIModelConstants | Configuration for the AI model to rank sub-problems. |
| entitiesRankingsModel                      | IEngineBaseAIModelConstants | Configuration for the AI model to rank entities. |
| solutionsRankingsModel                     | IEngineBaseAIModelConstants | Configuration for the AI model to rank solutions. |
| prosConsRankingsModel                      | IEngineBaseAIModelConstants | Configuration for the AI model to rank pros and cons. |
| getPageAnalysisModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to analyze pages. |
| getSolutionsPagesAnalysisModel             | IEngineBaseAIModelConstants | Configuration for the AI model to analyze solutions pages. |
| rankWebSolutionsModel                      | IEngineBaseAIModelConstants | Configuration for the AI model to rank web solutions. |
| reduceSubProblemsModel                     | IEngineBaseAIModelConstants | Configuration for the AI model to reduce sub-problems. |
| rateWebEvidenceModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to rate web evidence. |
| rateWebRootCausesModel                     | IEngineBaseAIModelConstants | Configuration for the AI model to rate web root causes. |
| rankWebEvidenceModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to rank web evidence. |
| rankWebRootCausesModel                     | IEngineBaseAIModelConstants | Configuration for the AI model to rank web root causes. |
| getRefinedEvidenceModel                    | IEngineBaseAIModelConstants | Configuration for the AI model to refine evidence. |
| getRefinedRootCausesModel                  | IEngineBaseAIModelConstants | Configuration for the AI model to refine root causes. |
| reapSolutionsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model to reap solutions. |
| groupSolutionsModel                        | IEngineBaseAIModelConstants | Configuration for the AI model to group solutions. |
| rateSolutionsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model to rate solutions. |
| createSolutionsModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to create solutions. |
| evolveSolutionsModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to evolve solutions. |
| createProsConsModel                        | IEngineBaseAIModelConstants | Configuration for the AI model to create pros and cons. |
| evolutionMutateModel                       | IEngineBaseAIModelConstants | Configuration for the AI model to mutate during evolution. |
| evolutionRecombineModel                    | IEngineBaseAIModelConstants | Configuration for the AI model to recombine during evolution. |
| validationModel                            | IEngineBaseAIModelConstants | Configuration for the AI model to validate data. |
| ingestionModel                             | IEngineBaseAIModelConstants | Configuration for the AI model to ingest data. |
| engineerModel                              | IEngineBaseAIModelConstants | Configuration for the AI model to engineer solutions. |
| getPageCacheExpiration                     | number | Time in seconds before page cache expires. |
| maxSubProblems                             | number | Maximum number of sub-problems allowed. |
| maxNumberGeneratedOfEntities               | number | Maximum number of entities that can be generated. |
| maxStabilityRetryCount                     | number | Maximum number of retries for stability. |
| mainLLMmaxRetryCount                       | number | Maximum number of retries for the main LLM. |
| limitedLLMmaxRetryCount                    | number | Maximum number of retries for the limited LLM. |
| rankingLLMmaxRetryCount                    | number | Maximum number of retries for the ranking LLM. |
| maxTopEntitiesToSearch                     | number | Maximum number of top entities to search. |
| maxTopEntitiesToRender                     | number | Maximum number of top entities to render. |
| maxTopQueriesToSearchPerType               | number | Maximum number of top queries to search per type. |
| maxTopEvidenceQueriesToSearchPerType       | number | Maximum number of top evidence queries to search per type. |
| maxTopRootCauseQueriesToSearchPerType      | number | Maximum number of top root cause queries to search per type. |
| maxRootCausePercentOfSearchResultWebPagesToGet | number | Maximum percentage of search result web pages to get for root causes. |
| maxRootCausesToUseForRatingRootCauses      | number | Maximum number of root causes to use for rating. |
| topWebPagesToGetForRefineRootCausesScan    | number | Number of top web pages to get for refining root causes scan. |
| mainSearchRetryCount                       | number | Maximum number of retries for the main search. |
| maxDalleRetryCount                         | number | Maximum number of retries for DALL-E. |
| maxTopWebPagesToGet                        | number | Maximum number of top web pages to get. |
| maxBingSearchResults                       | number | Maximum number of Bing search results. |
| maxTopProsConsUsedForRating                | number | Maximum number of top pros and cons used for rating. |
| maxNumberGeneratedProsConsForSolution      | number | Maximum number of generated pros and cons for a solution. |
| minSleepBeforeBrowserRequest               | number | Minimum sleep time in milliseconds before a browser request. |
| maxAdditionalRandomSleepBeforeBrowserRequest | number | Maximum additional random sleep time in milliseconds before a browser request. |
| numberOfSearchTypes                        | number | Number of search types. |
| webPageNavTimeout                          | number | Web page navigation timeout in milliseconds. |
| subProblemsRankingMinNumberOfMatches       | number | Minimum number of matches for sub-problems ranking. |
| currentUserAgent                           | string | Current user agent string for web requests. |
| topItemsToKeepForTopicClusterPruning       | number | Number of top items to keep for topic cluster pruning. |
| chances                                    | object | Probabilities and chances for various operations. |
| maxTopSearchQueriesForSolutionCreation     | number | Maximum number of top search queries for solution creation. |
| maxPercentOfSolutionsWebPagesToGet         | number | Maximum percentage of solution web pages to get. |
| limits                                     | object | Limits for various operations. |
| enable                                     | object | Enable flags for various features. |
| evolution                                  | object | Configuration for evolution operations. |
| maxPercentOfEloMatched                     | number | Maximum percentage of ELO matched. |
| minimumNumberOfPairwiseVotesForPopulation  | number | Minimum number of pairwise votes for population. |
| maxNumberOfPairwiseRankingPrompts          | number | Maximum number of pairwise ranking prompts. |
| maxTopSolutionsToCreatePolicies            | number | Maximum number of top solutions to create policies. |
| maxTopPoliciesToProcess                    | number | Maximum number of top policies to process. |
| maxEvidenceToUseForRatingEvidence          | number | Maximum number of evidence to use for rating evidence. |
| policyEvidenceFieldTypes                   | string[] | Types of evidence fields for policy. |
| rootCauseFieldTypes                        | string[] | Types of root cause fields. |
| simplifyEvidenceType                       | function | Function to simplify evidence type names. |
| simplifyRootCauseType                      | function | Function to simplify root cause type names. |

## Example

```typescript
// Example usage of IEngineConstants
import { IEngineConstants } from '@policysynth/agents/constants.js';

console.log(IEngineConstants.gpt4InTokenPrice);
```