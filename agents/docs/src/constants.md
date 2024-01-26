# IEngineConstants

This class contains constants and configurations for various AI models and operational parameters used within the engine.

## Properties

| Name                                           | Type                                      | Description |
|------------------------------------------------|-------------------------------------------|-------------|
| createSubProblemsModel                         | IEngineBaseAIModelConstants               | Model constants for creating sub-problems. |
| policiesSeedModel                              | IEngineBaseAIModelConstants               | Model constants for seeding policies. |
| analyseExternalSolutionsModel                  | IEngineBaseAIModelConstants               | Model constants for analyzing external solutions. |
| createEntitiesModel                            | IEngineBaseAIModelConstants               | Model constants for creating entities. |
| topicMapSolutionsModel                         | { inTokenCostsUSD: number; }              | Model constants for mapping solutions topics. |
| createSolutionImagesModel                      | IEngineBaseAIModelConstants               | Model constants for creating solution images. |
| createSearchQueriesModel                       | IEngineBaseAIModelConstants               | Model constants for creating search queries. |
| createEvidenceSearchQueriesModel               | IEngineBaseAIModelConstants               | Model constants for creating evidence search queries. |
| createRootCauseSearchQueriesModel              | IEngineBaseAIModelConstants               | Model constants for creating root cause search queries. |
| searchQueryRankingsModel                       | IEngineBaseAIModelConstants               | Model constants for search query rankings. |
| searchResultsRankingsModel                     | IEngineBaseAIModelConstants               | Model constants for search results rankings. |
| subProblemsRankingsModel                       | IEngineBaseAIModelConstants               | Model constants for sub-problems rankings. |
| entitiesRankingsModel                          | IEngineBaseAIModelConstants               | Model constants for entities rankings. |
| solutionsRankingsModel                         | IEngineBaseAIModelConstants               | Model constants for solutions rankings. |
| prosConsRankingsModel                          | IEngineBaseAIModelConstants               | Model constants for pros and cons rankings. |
| getPageAnalysisModel                           | IEngineBaseAIModelConstants               | Model constants for page analysis. |
| getSolutionsPagesAnalysisModel                 | IEngineBaseAIModelConstants               | Model constants for solutions pages analysis. |
| rankWebSolutionsModel                          | IEngineBaseAIModelConstants               | Model constants for web solutions ranking. |
| reduceSubProblemsModel                         | IEngineBaseAIModelConstants               | Model constants for reducing sub-problems. |
| rateWebEvidenceModel                           | IEngineBaseAIModelConstants               | Model constants for web evidence rating. |
| rateWebRootCausesModel                         | IEngineBaseAIModelConstants               | Model constants for web root causes rating. |
| rankWebEvidenceModel                           | IEngineBaseAIModelConstants               | Model constants for web evidence ranking. |
| rankWebRootCausesModel                         | IEngineBaseAIModelConstants               | Model constants for web root causes ranking. |
| getRefinedEvidenceModel                        | IEngineBaseAIModelConstants               | Model constants for refined evidence retrieval. |
| getRefinedRootCausesModel                      | IEngineBaseAIModelConstants               | Model constants for refined root causes retrieval. |
| reapSolutionsModel                             | IEngineBaseAIModelConstants               | Model constants for reaping solutions. |
| groupSolutionsModel                            | IEngineBaseAIModelConstants               | Model constants for grouping solutions. |
| rateSolutionsModel                             | IEngineBaseAIModelConstants               | Model constants for solutions rating. |
| createSolutionsModel                           | IEngineBaseAIModelConstants               | Model constants for creating solutions. |
| evolveSolutionsModel                           | IEngineBaseAIModelConstants               | Model constants for evolving solutions. |
| createProsConsModel                            | IEngineBaseAIModelConstants               | Model constants for creating pros and cons. |
| evolutionMutateModel                           | IEngineBaseAIModelConstants               | Model constants for evolution mutation. |
| evolutionRecombineModel                        | IEngineBaseAIModelConstants               | Model constants for evolution recombination. |
| validationModel                                | IEngineBaseAIModelConstants               | Model constants for validation. |
| getPageCacheExpiration                         | number                                    | Cache expiration time for pages. |
| maxSubProblems                                 | number                                    | Maximum number of sub-problems. |
| maxNumberGeneratedOfEntities                   | number                                    | Maximum number of entities generated. |
| maxStabilityRetryCount                         | number                                    | Maximum retry count for stability. |
| mainLLMmaxRetryCount                           | number                                    | Maximum retry count for main LLM. |
| limitedLLMmaxRetryCount                        | number                                    | Maximum retry count for limited LLM. |
| rankingLLMmaxRetryCount                        | number                                    | Maximum retry count for ranking LLM. |
| maxTopEntitiesToSearch                         | number                                    | Maximum top entities to search. |
| maxTopEntitiesToRender                         | number                                    | Maximum top entities to render. |
| maxTopQueriesToSearchPerType                   | number                                    | Maximum top queries to search per type. |
| maxTopEvidenceQueriesToSearchPerType           | number                                    | Maximum top evidence queries to search per type. |
| maxTopRootCauseQueriesToSearchPerType          | number                                    | Maximum top root cause queries to search per type. |
| maxRootCausePercentOfSearchResultWebPagesToGet | number                                    | Maximum root cause percent of search result web pages to get. |
| maxRootCausesToUseForRatingRootCauses          | number                                    | Maximum root causes to use for rating root causes. |
| topWebPagesToGetForRefineRootCausesScan        | number                                    | Top web pages to get for refine root causes scan. |
| mainSearchRetryCount                           | number                                    | Main search retry count. |
| maxDalleRetryCount                             | number                                    | Maximum DALL·E retry count. |
| maxTopWebPagesToGet                            | number                                    | Maximum top web pages to get. |
| maxBingSearchResults                           | number                                    | Maximum Bing search results. |
| maxTopProsConsUsedForRating                    | number                                    | Maximum top pros and cons used for rating. |
| maxNumberGeneratedProsConsForSolution          | number                                    | Maximum number of generated pros and cons for solution. |
| minSleepBeforeBrowserRequest                   | number                                    | Minimum sleep before browser request. |
| maxAdditionalRandomSleepBeforeBrowserRequest   | number                                    | Maximum additional random sleep before browser request. |
| numberOfSearchTypes                            | number                                    | Number of search types. |
| webPageNavTimeout                              | number                                    | Web page navigation timeout. |
| subProblemsRankingMinNumberOfMatches           | number                                    | Sub-problems ranking minimum number of matches. |
| currentUserAgent                               | string                                    | Current user agent. |
| topItemsToKeepForTopicClusterPruning           | number                                    | Top items to keep for topic cluster pruning. |
| chances                                        | object                                    | Chances for various operations. |
| maxTopSearchQueriesForSolutionCreation         | number                                    | Maximum top search queries for solution creation. |
| maxPercentOfSolutionsWebPagesToGet             | number                                    | Maximum percent of solutions web pages to get. |
| limits                                         | object                                    | Limits for various operations. |
| enable                                         | object                                    | Enable flags for various refinements. |
| evolution                                      | object                                    | Evolution parameters. |
| maxPercentOfEloMatched                         | number                                    | Maximum percent of ELO matched. |
| minimumNumberOfPairwiseVotesForPopulation      | number                                    | Minimum number of pairwise votes for population. |
| maxNumberOfPairwiseRankingPrompts              | number                                    | Maximum number of pairwise ranking prompts. |
| maxTopSolutionsToCreatePolicies                | number                                    | Maximum top solutions to create policies. |
| maxTopPoliciesToProcess                        | number                                    | Maximum top policies to process. |
| maxEvidenceToUseForRatingEvidence              | number                                    | Maximum evidence to use for rating evidence. |
| policyEvidenceFieldTypes                       | string[]                                  | Policy evidence field types. |
| rootCauseFieldTypes                            | string[]                                  | Root cause field types. |

## Methods

| Name                     | Parameters                  | Return Type | Description |
|--------------------------|-----------------------------|-------------|-------------|
| simplifyEvidenceType     | evidenceType: string        | string      | Simplifies the evidence type string. |
| simplifyRootCauseType    | rootCauseType: string       | string      | Simplifies the root cause type string. |

## Example

```typescript
// Example usage of IEngineConstants
import { IEngineConstants } from '@policysynth/agents/constants.ts';

console.log(IEngineConstants.createSubProblemsModel.name);
// Output: gpt-4-1106-preview
```