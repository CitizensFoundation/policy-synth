# IEngineConstants

This class encapsulates constants and configurations used across the engine for handling AI models, including their parameters and limits for operations.

## Properties

| Name                                           | Type    | Description |
|------------------------------------------------|---------|-------------|
| createSubProblemsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used in creating sub-problems. |
| policiesSeedModel                              | IEngineBaseAIModelConstants | Configuration for the AI model used in seeding policies. |
| analyseExternalSolutionsModel                  | IEngineBaseAIModelConstants | Configuration for the AI model used in analyzing external solutions. |
| createEntitiesModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used in creating entities. |
| topicMapSolutionsModel                         | Object  | Contains the inTokenCostsUSD for the topic map solutions model. |
| createSolutionImagesModel                      | IEngineBaseAIModelConstants | Configuration for the AI model used in creating solution images. |
| createSearchQueriesModel                       | IEngineBaseAIModelConstants | Configuration for the AI model used in creating search queries. |
| createEvidenceSearchQueriesModel               | IEngineBaseAIModelConstants | Configuration for the AI model used in creating evidence search queries. |
| createRootCauseSearchQueriesModel              | IEngineBaseAIModelConstants | Configuration for the AI model used in creating root cause search queries. |
| searchQueryRankingsModel                       | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking search queries. |
| searchResultsRankingsModel                     | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking search results. |
| subProblemsRankingsModel                       | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking sub-problems. |
| entitiesRankingsModel                          | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking entities. |
| solutionsRankingsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking solutions. |
| prosConsRankingsModel                          | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking pros and cons. |
| getPageAnalysisModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in getting page analysis. |
| getSolutionsPagesAnalysisModel                 | IEngineBaseAIModelConstants | Configuration for the AI model used in getting solutions pages analysis. |
| rankWebSolutionsModel                          | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking web solutions. |
| reduceSubProblemsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used in reducing sub-problems. |
| rateWebEvidenceModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in rating web evidence. |
| rateWebRootCausesModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used in rating web root causes. |
| rankWebEvidenceModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking web evidence. |
| rankWebRootCausesModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used in ranking web root causes. |
| getRefinedEvidenceModel                        | IEngineBaseAIModelConstants | Configuration for the AI model used in getting refined evidence. |
| getRefinedRootCausesModel                      | IEngineBaseAIModelConstants | Configuration for the AI model used in getting refined root causes. |
| reapSolutionsModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used in reaping solutions. |
| groupSolutionsModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used in grouping solutions. |
| rateSolutionsModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used in rating solutions. |
| createSolutionsModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in creating solutions. |
| evolveSolutionsModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in evolving solutions. |
| createProsConsModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used in creating pros and cons. |
| evolutionMutateModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used in evolution mutation. |
| evolutionRecombineModel                        | IEngineBaseAIModelConstants | Configuration for the AI model used in evolution recombination. |
| validationModel                                | IEngineBaseAIModelConstants | Configuration for the AI model used in validation. |
| getPageCacheExpiration                         | number  | The expiration time for page cache in seconds. |
| maxSubProblems                                 | number  | The maximum number of sub-problems allowed. |
| maxNumberGeneratedOfEntities                   | number  | The maximum number of entities that can be generated. |
| maxStabilityRetryCount                         | number  | The maximum number of retries for stability checks. |
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
| maxDalleRetryCount                             | number  | The maximum number of retries for DALL·E operations. |
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
| chances                                        | Object  | Contains the chances configuration for various operations. |
| maxTopSearchQueriesForSolutionCreation         | number  | The maximum number of top search queries for solution creation. |
| maxPercentOfSolutionsWebPagesToGet             | number  | The maximum percentage of solutions web pages to get. |
| limits                                         | Object  | Contains the limits configuration for various operations. |
| enable                                         | Object  | Contains the enable configuration for various refinement operations. |
| evolution                                      | Object  | Contains the evolution configuration for various operations. |
| maxPercentOfEloMatched                         | number  | The maximum percentage of ELO matched. |
| minimumNumberOfPairwiseVotesForPopulation      | number  | The minimum number of pairwise votes for the population. |
| maxNumberOfPairwiseRankingPrompts              | number  | The maximum number of pairwise ranking prompts. |
| maxTopSolutionsToCreatePolicies                | number  | The maximum number of top solutions to create policies for. |
| maxTopPoliciesToProcess                        | number  | The maximum number of top policies to process. |
| maxEvidenceToUseForRatingEvidence              | number  | The maximum number of evidence to use for rating evidence. |
| policyEvidenceFieldTypes                       | string[] | The field types for policy evidence. |
| rootCauseFieldTypes                            | string[] | The field types for root causes. |

## Methods

| Name                    | Parameters            | Return Type | Description |
|-------------------------|-----------------------|-------------|-------------|
| simplifyEvidenceType    | evidenceType: string  | string      | Simplifies the evidence type string by removing prefixes and suffixes. |
| simplifyRootCauseType   | rootCauseType: string | string      | Simplifies the root cause type string by removing prefixes, suffixes, and making it singular if necessary. |

## Example

```typescript
// Example usage of IEngineConstants
import { IEngineConstants } from '@policysynth/agents/constants.js';

console.log(IEngineConstants.createSubProblemsModel.name); // Outputs: gpt-4-1106-preview
console.log(IEngineConstants.maxSubProblems); // Outputs: 7
```