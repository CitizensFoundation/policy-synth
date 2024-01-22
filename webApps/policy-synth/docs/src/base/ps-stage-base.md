# PsStageBase

Abstract base class for problem-solving stages in the application.

## Properties

| Name                    | Type                                      | Description                                                                 |
|-------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| memory                  | IEngineInnovationMemoryData               | Memory data for the engine innovation.                                      |
| childType               | "solution" \| "policy"                    | Type of child element, either "solution" or "policy".                       |
| showEloRatings          | boolean                                   | Flag to show or hide ELO ratings.                                           |
| activeSubProblemIndex   | number \| null                            | Index of the currently active sub-problem.                                  |
| activeSolutionIndex     | number \| null                            | Index of the currently active solution.                                     |
| activePolicyIndex       | number \| null                            | Index of the currently active policy.                                       |
| activePopulationIndex   | number                                    | Index of the currently active population.                                   |
| firstTimeSubProblemClick| boolean                                   | Flag indicating if it's the first time a sub-problem is clicked.            |
| activeGroupIndex        | number \| null                            | Index of the currently active group.                                        |
| longDescriptions        | boolean                                   | Flag to indicate if long descriptions should be used.                       |
| router                  | PsRouter                                  | Router instance for navigation.                                             |
| displayStates           | Map                                       | Map to track display states of various UI elements.                         |

## Methods

| Name                    | Parameters                               | Return Type | Description                                                                 |
|-------------------------|------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback       |                                          | void        | Lifecycle method that runs when the component is added to the DOM.          |
| updateRoutes            |                                          | void        | Updates the routes based on the current state.                              |
| updated                 | changedProperties: Map                   | void        | Lifecycle method that runs when properties are updated.                     |
| exitSubProblemScreen    |                                          | void        | Handles the exit action from the sub-problem screen.                        |
| toggleDisplayState      | title: string                            | Promise<void> | Toggles the display state of a UI element with the given title.             |
| toggleScores            |                                          | void        | Toggles the display of scores.                                              |
| fixImageUrlIfNeeded     | url: string                              | string      | Fixes the image URL if needed.                                              |
| styles                  |                                          | css[]       | Static getter for styles.                                                   |
| isUsedSearch            | result: IEngineSearchResultItem, index: number | string | Determines if a search result is used based on its index.                   |
| closeSubProblem         | event: CustomEvent                       | void        | Closes the sub-problem view.                                                |
| setSubProblemColor      | index: number                            | void        | Sets the color theme based on the sub-problem index.                        |
| setSubProblem           | index: number                            | void        | Sets the active sub-problem based on the index.                             |
| toggleDarkMode          |                                          | void        | Toggles the dark mode theme.                                                |
| renderThemeToggle       |                                          | TemplateResult | Renders the theme toggle button.                                           |
| renderProblemStatement  | title: string \| undefined               | TemplateResult | Renders the problem statement section.                                     |
| renderSubProblemList    | subProblems: IEngineSubProblem[], title: string | TemplateResult | Renders the list of sub-problems.                                          |
| getImgHeight            | renderCloseButton: boolean               | number      | Gets the image height based on whether the close button is rendered.        |
| getImgWidth             | renderCloseButton: boolean               | number      | Gets the image width based on whether the close button is rendered.         |
| renderSubProblemImageUrl| renderCloseButton: boolean, subProblem: IEngineSubProblem | TemplateResult | Renders the image URL for a sub-problem.                                   |
| renderSubProblem        | subProblem: IEngineSubProblem, isLessProminent: boolean, index: number, renderCloseButton: boolean, renderMoreInfo: boolean, hideAllButtons: boolean | TemplateResult | Renders a sub-problem.                                                     |
| renderSearchQueries     | title: string, searchQueries: IEngineSearchQueries | TemplateResult | Renders the search queries section.                                        |
| getUrlInRightSize       | url: string                              | string      | Adjusts the URL to fit within the UI constraints.                           |
| renderSearchResults     | title: string, searchResults: IEngineSearchResults | TemplateResult | Renders the search results section.                                        |

## Events

- **update-route**: Emitted when the route needs to be updated based on the current state.
- **yp-theme-color**: Emitted to set the theme color.
- **yp-theme-dark-mode**: Emitted to toggle the dark mode theme.

## Examples

```typescript
// Example usage of PsStageBase
class MyCustomStage extends PsStageBase {
  // Implement abstract methods and properties specific to MyCustomStage
}
```

Note: The provided TypeScript class is abstract and is intended to be extended by concrete classes that implement the specific logic for different stages of problem-solving within the application. The documentation above outlines the properties, methods, and events that are common to all stages derived from `PsStageBase`.