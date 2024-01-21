# CpsSolutions

CpsSolutions is a custom element that extends the CpsStageBase class. It provides functionality for displaying and interacting with solutions related to sub-problems in a problem-solving context. It includes features such as filtering solutions by generation, searching, handling swipe gestures, and keyboard navigation.

## Properties

| Name                         | Type      | Description                                                                 |
|------------------------------|-----------|-----------------------------------------------------------------------------|
| isDropdownVisible            | Boolean   | Indicates if the dropdown for selecting generations is visible.             |
| searchText                   | String    | Text used for filtering solutions by search.                                |
| activeFilteredSolutionIndex  | Number    | Index of the currently active filtered solution.                            |
| isSearchVisible              | Boolean   | Indicates if the search input is visible.                                   |
| hideExtraSolutionInformation | Boolean   | Determines whether to hide additional information about a solution.         |
| isLoadingMiddle              | Boolean   | Indicates if the component is currently loading middle data.                |
| groupListScrollPositionY     | Number    | Y-axis scroll position of the group list.                                   |
| lastKeys                     | any[]     | Array of the last keys pressed, used for detecting certain keyboard actions.|
| findBarProbablyOpen          | Boolean   | Indicates if the find bar is likely open based on keyboard interactions.    |
| solutionListScrollPositionX  | Number    | X-axis scroll position of the solution list.                                |
| solutionListScrollPositionY  | Number    | Y-axis scroll position of the solution list.                                |

## Methods

| Name                    | Parameters                  | Return Type | Description                                                                 |
|-------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| handleGroupButtonClick  | groupIndex: Number          | Promise<void> | Handles the click event on a group button.                                 |
| reset                   |                             | void        | Resets the search text, visibility states, and active indices.              |
| connectedCallback       |                             | void        | Lifecycle method called when the element is added to the document's DOM.    |
| disconnectedCallback    |                             | void        | Lifecycle method called when the element is removed from the document's DOM.|
| updateSwipeIndex        | direction: String           | void        | Updates the index of the active solution based on swipe direction.          |
| loadMiddleData          |                             | Promise<void> | Asynchronously loads middle data for solutions.                             |
| handleKeyDown           | e: KeyboardEvent            | void        | Handles key down events for keyboard navigation.                            |
| exitSolutionScreen      |                             | void        | Handles the exit action from the solution detail screen.                    |
| handleTouchStart        | e: TouchEvent               | void        | Handles the start of a touch event for swipe gestures.                      |
| handleTouchEnd          | e: TouchEvent               | void        | Handles the end of a touch event for swipe gestures.                        |
| updated                 | changedProperties: Map      | void        | Lifecycle method called after the element’s properties have changed.        |

## Events

- **yp-theme-color**: Emitted with a color value when the theme color should be updated based on the active sub-problem.

## Examples

```typescript
// Example usage of the CpsSolutions custom element
<yps-solutions></yps-solutions>
```

Please note that the above example is a simple usage scenario. The actual use of the `CpsSolutions` element involves interaction with its properties and methods, which would typically be done within a larger application context.