# PsStageBase

PsStageBase is an abstract class that extends YpBaseElement to provide functionalities related to stages in the application. It manages properties such as memory, childType, showEloRatings, active indexes for sub-problems, solutions, policies, populations, and groups. It also handles UI states like longDescriptions, displayStates, and subProblemColors. The class includes methods for updating routes, toggling display states, handling sub-problem interactions, and rendering UI components like theme toggles, problem statements, and sub-problem lists.

## Properties

| Name                        | Type                                  | Description                                                                 |
|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| memory                      | PsSmarterCrowdsourcingMemoryData                      | Memory object containing data related to the current state.                 |
| childType                   | "solution" \| "policy"                | Type of child element, either "solution" or "policy".                       |
| showEloRatings              | boolean                               | Flag to show or hide ELO ratings.                                           |
| activeSubProblemIndex       | number \| null                        | Index of the currently active sub-problem.                                  |
| activeSolutionIndex         | number \| null                        | Index of the currently active solution.                                     |
| activePolicyIndex           | number \| null                        | Index of the currently active policy.                                       |
| activePopulationIndex       | number                                | Index of the currently active population.                                   |
| firstTimeSubProblemClick    | boolean                               | Flag to indicate if it's the first time a sub-problem has been clicked.     |
| activeGroupIndex            | number \| null                        | Index of the currently active group.                                        |
| longDescriptions            | boolean                               | Flag to indicate if long descriptions should be used.                       |
| router                      | PsRouter                              | Router instance for navigation.                                             |
| displayStates               | Map                                   | Map to manage the display states of various UI components.                  |
| subProblemListScrollPositionX | number                              | X-axis scroll position of the sub-problem list.                             |
| subProblemListScrollPositionY | number                              | Y-axis scroll position of the sub-problem list.                             |
| subProblemColors            | string[]                              | Array of colors used for sub-problems.                                      |
| maxTopSearchQueries         | number                                | Maximum number of top search queries to display.                            |
| maxUsedSearchResults        | number                                | Maximum number of search results to use.                                    |

## Methods

| Name                        | Parameters                           | Return Type | Description                                                                 |
|-----------------------------|--------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback           |                                      | void        | Lifecycle method called when the element is added to the document's DOM.   |
| updateRoutes                |                                      | void        | Updates the routes based on the active indexes.                             |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element’s properties have changed.       |
| exitSubProblemScreen        |                                      | void        | Scrolls the window back to the sub-problem list's scroll position.          |
| toggleDisplayState          | title: string                        | Promise<void> | Toggles the display state of a UI component based on its title.             |
| toggleScores                |                                      | void        | Toggles the visibility of ELO ratings.                                      |
| fixImageUrlIfNeeded         | url: string                          | string      | Fixes the image URL if needed to ensure it uses HTTPS.                      |
| isUsedSearch                | result: PsSearchResultItem, index: number | string | Determines if a search result is used based on its index.                   |
| closeSubProblem             | event: CustomEvent                   | void        | Closes the sub-problem screen and resets the activeSubProblemIndex.         |
| setSubProblemColor          | index: number                        | void        | Sets the theme color based on the sub-problem index.                        |
| setSubProblem               | index: number                        | void        | Sets the active sub-problem index and updates the routes.                   |
| toggleDarkMode              |                                      | void        | Toggles the dark mode theme.                                                |
| renderThemeToggle           |                                      | TemplateResult | Renders the theme toggle button.                                            |
| renderProblemStatement      | title: string \| undefined = undefined | TemplateResult | Renders the problem statement section.                                      |
| renderSubProblemList        | subProblems: PsSubProblem[], title = this.t('Sub Problems') | TemplateResult | Renders the list of sub-problems.                                           |
| getImgHeight                | renderCloseButton: boolean           | number      | Gets the image height based on the renderCloseButton flag.                  |
| getImgWidth                 | renderCloseButton: boolean           | number      | Gets the image width based on the renderCloseButton flag.                   |
| renderSubProblemImageUrl    | renderCloseButton: boolean, subProblem: PsSubProblem | TemplateResult | Renders the image URL for a sub-problem.                                    |
| renderSubProblem            | subProblem: PsSubProblem, isLessProminent: boolean, index: number, renderCloseButton: boolean = false, renderMoreInfo = false, hideAllButtons = false | TemplateResult | Renders a sub-problem.                                                      |
| renderSearchQueries         | title: string, searchQueries: PsSearchQueries | TemplateResult | Renders the search queries section.                                         |
| getUrlInRightSize           | url: string                          | string      | Adjusts the URL to fit within the UI constraints.                           |
| renderSearchResults         | title: string, searchResults: PsSearchResults | TemplateResult | Renders the search results section.                                         |

## Events

## Example

```typescript
import { PsStageBase } from '@policysynth/webapp/base/ps-stage-base.js';

// Example usage of PsStageBase
class ExampleStage extends PsStageBase {
  // Implementation specific to the derived class
}
```

