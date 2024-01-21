# CpsStageBase

Abstract class that serves as a base for different stages in a collaborative problem-solving process.

## Properties

| Name                     | Type                                  | Description                                                                 |
|--------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| memory                   | IEngineInnovationMemoryData           | Memory data related to the engine innovation.                                |
| childType                | "solution" \| "policy"                | Type of child element, either "solution" or "policy".                       |
| showEloRatings           | boolean                               | Flag to show or hide ELO ratings.                                           |
| activeSubProblemIndex    | number \| null                        | Index of the currently active sub-problem.                                  |
| activeSolutionIndex      | number \| null                        | Index of the currently active solution.                                     |
| activePolicyIndex        | number \| null                        | Index of the currently active policy.                                       |
| activePopulationIndex    | number                                | Index of the currently active population.                                   |
| firstTimeSubProblemClick | boolean                               | Flag indicating if it's the first time a sub-problem is clicked.            |
| activeGroupIndex         | number                                | Index of the currently active group.                                        |
| longDescriptions         | boolean                               | Flag to indicate if long descriptions should be used.                       |
| router                   | Router                                | Router instance for navigation.                                             |
| displayStates            | Map                                   | Map to track the display states of various UI elements.                     |
| subProblemListScrollPositionX | number                          | Horizontal scroll position of the sub-problem list.                         |
| subProblemListScrollPositionY | number                          | Vertical scroll position of the sub-problem list.                           |
| subProblemColors         | string[]                              | Array of colors associated with sub-problems.                               |
| maxTopSearchQueries      | number                                | Maximum number of top search queries to display.                            |
| maxUsedSearchResults     | number                                | Maximum number of search results to use.                                    |

## Methods

| Name                     | Parameters                            | Return Type | Description                                                                 |
|--------------------------|---------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback        |                                       | void        | Lifecycle method that runs when the component is added to the DOM.          |
| updateRoutes             |                                       | void        | Updates the routes based on the current state.                              |
| updated                  | changedProperties: Map                | void        | Lifecycle method that runs when the component's properties have changed.    |
| exitSubProblemScreen     |                                       | void        | Restores the scroll position when exiting the sub-problem screen.           |
| toggleDisplayState       | title: string                         | Promise<void> | Toggles the display state of a UI element with the given title.          |
| toggleScores             |                                       | void        | Toggles the visibility of ELO ratings.                                      |
| fixImageUrlIfNeeded      | url: string                           | string      | Fixes the image URL if it does not start with 'https'.                      |
| isUsedSearch             | result: IEngineSearchResultItem, index: number | string | Returns a class name based on whether the search result is used.            |
| closeSubProblem          | event: CustomEvent                    | void        | Closes the sub-problem screen and emits a theme color event.                 |
| setSubProblemColor       | index: number                         | void        | Sets the theme color based on the sub-problem index.                        |
| setSubProblem            | index: number                         | void        | Sets the active sub-problem index and updates the scroll position.          |
| toggleDarkMode           |                                       | void        | Toggles the dark mode theme.                                                |
| renderThemeToggle        |                                       | TemplateResult | Renders the theme toggle button.                                         |
| renderProblemStatement   | title: string \| undefined            | TemplateResult | Renders the problem statement section.                                   |
| renderSubProblemList     | subProblems: IEngineSubProblem[], title: string | TemplateResult | Renders the list of sub-problems.                                        |
| getImgHeight             | renderCloseButton: boolean            | number      | Returns the image height based on the renderCloseButton flag.               |
| getImgWidth              | renderCloseButton: boolean            | number      | Returns the image width based on the renderCloseButton flag.                |
| renderSubProblemImageUrl | renderCloseButton: boolean, subProblem: IEngineSubProblem | TemplateResult | Renders the image URL for a sub-problem.                                 |
| renderSubProblem         | subProblem: IEngineSubProblem, isLessProminent: boolean, index: number, renderCloseButton: boolean, renderMoreInfo: boolean, hideAllButtons: boolean | TemplateResult | Renders a sub-problem.                                                   |
| renderSearchQueries      | title: string, searchQueries: IEngineSearchQueries | TemplateResult | Renders the search queries section.                                      |
| getUrlInRightSize        | url: string                           | string      | Returns the URL in the right size for display.                             |
| renderSearchResults      | title: string, searchResults: IEngineSearchResults | TemplateResult | Renders the search results section.                                      |

## Events

- **update-route**: Emitted when the route needs to be updated with the current state.
- **yp-theme-color**: Emitted when the theme color is set based on the sub-problem index.
- **yp-theme-dark-mode**: Emitted when the dark mode theme is toggled.

## Examples

```typescript
// Example usage of the CpsStageBase class
class ExampleStage extends CpsStageBase {
  // Implementation of abstract class methods and properties
}
```

Note: The provided TypeScript file contains a lot of UI-related logic and rendering methods which are not typical for API documentation. The documentation above focuses on the properties, methods, and events that are more relevant to an API consumer.