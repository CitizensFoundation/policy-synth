# PsStageBase

PsStageBase is an abstract class that extends YpBaseElement, providing functionalities related to the stages of policy synthesis. It manages the state and behavior of various UI components such as sub-problems, solutions, policies, and search results within the policy synthesis process.

## Properties

| Name                        | Type                                      | Description                                                                 |
|-----------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| memory                      | IEngineInnovationMemoryData               | Holds the memory data related to the engine's innovation process.           |
| childType                   | "solution" \| "policy"                    | Specifies the type of child elements, either "solution" or "policy".       |
| showEloRatings              | boolean                                   | Determines whether Elo ratings should be displayed.                         |
| activeSubProblemIndex       | number \| null                            | Index of the currently active sub-problem.                                  |
| activeSolutionIndex         | number \| null                            | Index of the currently active solution.                                     |
| activePolicyIndex           | number \| null                            | Index of the currently active policy.                                       |
| activePopulationIndex       | number                                    | Index of the currently active population.                                   |
| firstTimeSubProblemClick    | boolean                                   | Indicates if it's the first time a sub-problem has been clicked.            |
| activeGroupIndex            | number \| null                            | Index of the currently active group.                                        |
| longDescriptions            | boolean                                   | Indicates if long descriptions should be used.                              |
| router                      | PsRouter                                  | The router instance for navigation.                                         |
| displayStates               | Map                                       | Holds the display states for various UI components.                         |
| subProblemListScrollPositionX | number                                  | The X-axis scroll position of the sub-problem list.                         |
| subProblemListScrollPositionY | number                                  | The Y-axis scroll position of the sub-problem list.                         |
| subProblemColors            | string[]                                  | Array of colors used for sub-problems.                                      |
| maxTopSearchQueries         | number                                    | Maximum number of top search queries to display.                            |
| maxUsedSearchResults        | number                                    | Maximum number of search results to use.                                    |

## Methods

| Name                        | Parameters                               | Return Type | Description                                                                 |
|-----------------------------|------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback           |                                          | void        | Lifecycle method that runs when the element is added to the document's DOM.|
| updateRoutes                |                                          | void        | Updates the routes based on the current state.                              |
| updated                     | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when properties change.                         |
| exitSubProblemScreen        |                                          | void        | Exits the sub-problem screen and returns to the previous scroll position.  |
| toggleDisplayState          | title: string                            | Promise<void> | Toggles the display state of a given title and maintains scroll position.  |
| toggleScores                |                                          | void        | Toggles the display of Elo ratings.                                         |
| fixImageUrlIfNeeded         | url: string                              | string      | Fixes the image URL to ensure it uses HTTPS.                                |
| isUsedSearch                | result: IEngineSearchResultItem, index: number | string | Determines if a search result is used based on its index.                   |
| closeSubProblem             | event: CustomEvent                       | void        | Closes the sub-problem screen and updates the theme color.                  |
| setSubProblemColor          | index: number                            | void        | Sets the theme color based on the sub-problem index.                        |
| setSubProblem               | index: number                            | void        | Sets the active sub-problem and updates routes and activities.              |
| toggleDarkMode              |                                          | void        | Toggles the dark mode theme.                                                |
| renderThemeToggle           |                                          | TemplateResult | Renders the theme toggle button.                                           |
| renderProblemStatement      | title: string \| undefined = undefined   | TemplateResult | Renders the problem statement section.                                     |
| renderSubProblemList        | subProblems: IEngineSubProblem[], title = this.t('Sub Problems') | TemplateResult | Renders the list of sub-problems.                                          |
| getImgHeight                | renderCloseButton: boolean               | number      | Gets the image height based on the screen width and button visibility.      |
| getImgWidth                 | renderCloseButton: boolean               | number      | Gets the image width based on the screen width and button visibility.       |
| renderSubProblemImageUrl    | renderCloseButton: boolean, subProblem: IEngineSubProblem | TemplateResult | Renders the image URL for a sub-problem.                                   |
| renderSubProblem            | subProblem: IEngineSubProblem, isLessProminent: boolean, index: number, renderCloseButton: boolean = false, renderMoreInfo = false, hideAllButtons = false | TemplateResult | Renders a sub-problem.                                                     |
| renderSearchQueries         | title: string, searchQueries: IEngineSearchQueries | TemplateResult | Renders the search queries section.                                         |
| getUrlInRightSize           | url: string                              | string      | Adjusts the URL to fit within the available space.                          |
| renderSearchResults         | title: string, searchResults: IEngineSearchResults | TemplateResult | Renders the search results section.                                         |

## Example

```typescript
import { PsStageBase } from '@policysynth/webapp/base/ps-stage-base.js';

// Example usage of PsStageBase
class ExampleStage extends PsStageBase {
  // Implementation specific to the derived class
}
```

