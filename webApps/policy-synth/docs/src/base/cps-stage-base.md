# CpsStageBase

Abstract class that serves as a base for different stages in a problem-solving process. It provides properties, methods, and rendering functions for managing and displaying problem statements, sub-problems, and related data.

## Properties

| Name                     | Type                                      | Description                                                                 |
|--------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| memory                   | IEngineInnovationMemoryData               | Memory data related to the innovation engine.                                |
| childType                | "solution" \| "policy"                    | Type of child elements, either "solution" or "policy".                       |
| showEloRatings           | boolean                                   | Flag to show or hide ELO ratings.                                            |
| activeSubProblemIndex    | number \| null                            | Index of the currently active sub-problem.                                   |
| activeSolutionIndex      | number \| null                            | Index of the currently active solution.                                      |
| activePolicyIndex        | number \| null                            | Index of the currently active policy.                                        |
| activePopulationIndex    | number                                    | Index of the currently active population.                                    |
| firstTimeSubProblemClick | boolean                                   | Flag indicating if it's the first time a sub-problem is clicked.             |
| activeGroupIndex         | number                                    | Index of the currently active group.                                         |
| longDescriptions         | boolean                                   | Flag to indicate if long descriptions should be used.                        |
| router                   | Router                                    | Router instance for navigation.                                              |
| displayStates            | Map                                       | Map to manage the display states of various UI elements.                     |
| subProblemListScrollPositionX | number                              | X-axis scroll position of the sub-problem list.                              |
| subProblemListScrollPositionY | number                              | Y-axis scroll position of the sub-problem list.                              |
| subProblemColors         | string[]                                  | Array of colors used for sub-problems.                                       |
| maxTopSearchQueries      | number                                    | Maximum number of top search queries to display.                             |
| maxUsedSearchResults     | number                                    | Maximum number of search results to use.                                     |

## Methods

| Name                     | Parameters                                | Return Type | Description                                                                 |
|--------------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback        |                                           | void        | Lifecycle method that runs when the component is added to the DOM.          |
| updateRoutes             |                                           | void        | Updates the routes based on the current state.                               |
| updated                  | changedProperties: Map                    | void        | Lifecycle method that runs when properties change.                           |
| exitSubProblemScreen     |                                           | void        | Restores the scroll position when exiting the sub-problem screen.            |
| toggleDisplayState       | title: string                             | Promise<void> | Toggles the display state of a UI element.                                  |
| toggleScores             |                                           | void        | Toggles the visibility of ELO ratings.                                       |
| fixImageUrlIfNeeded      | url: string                               | string      | Fixes the image URL if needed.                                               |
| isUsedSearch             | result: IEngineSearchResultItem, index: number | string | Determines if a search result is used based on its index.                    |
| closeSubProblem          | event: CustomEvent                        | void        | Closes the sub-problem screen.                                               |
| setSubProblemColor       | index: number                             | void        | Sets the theme color based on the sub-problem index.                         |
| setSubProblem            | index: number                             | void        | Sets the active sub-problem and updates the scroll position.                 |
| toggleDarkMode           |                                           | void        | Toggles the dark mode theme.                                                 |
| renderThemeToggle        |                                           | TemplateResult | Renders the theme toggle button.                                            |
| renderProblemStatement   | title: string \| undefined                | TemplateResult | Renders the problem statement section.                                      |
| renderSubProblemList     | subProblems: IEngineSubProblem[], title: string | TemplateResult | Renders the list of sub-problems.                                           |
| getImgHeight             | renderCloseButton: boolean                | number      | Gets the image height based on the rendering context.                        |
| getImgWidth              | renderCloseButton: boolean                | number      | Gets the image width based on the rendering context.                         |
| renderSubProblemImageUrl | renderCloseButton: boolean, subProblem: IEngineSubProblem | TemplateResult | Renders the image URL for a sub-problem.                                    |
| renderSubProblem         | subProblem: IEngineSubProblem, isLessProminent: boolean, index: number, renderCloseButton: boolean, renderMoreInfo: boolean, hideAllButtons: boolean | TemplateResult | Renders a sub-problem.                                                      |
| renderSearchQueries      | title: string, searchQueries: IEngineSearchQueries | TemplateResult | Renders the search queries section.                                         |
| getUrlInRightSize        | url: string                               | string      | Adjusts the URL to fit within the display constraints.                       |
| renderSearchResults      | title: string, searchResults: IEngineSearchResults | TemplateResult | Renders the search results section.                                         |

## Events

- **update-route**: Emitted when the route needs to be updated based on the current state.
- **yp-theme-color**: Emitted to set the theme color.
- **yp-theme-dark-mode**: Emitted to toggle the dark mode theme.

## Examples

```typescript
// Example usage of the CpsStageBase class
class ExampleStage extends CpsStageBase {
  // Implement abstract methods and properties specific to the example stage
}
```

Note: The provided TypeScript class is abstract and should be extended to create concrete implementations for different stages of the problem-solving process. The class includes a variety of properties and methods for managing the display and interaction with problem statements, sub-problems, and related data.