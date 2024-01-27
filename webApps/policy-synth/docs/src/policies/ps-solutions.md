# PsSolutions

`PsSolutions` extends `PsStageBase` to manage and display solutions related to specific sub-problems within a policy synthesis process. It supports functionalities like filtering solutions by generation, searching, handling group actions, and navigating through solutions with swipe gestures or keyboard inputs.

## Properties

| Name                          | Type    | Description                                                                 |
|-------------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible             | Boolean | Indicates if the dropdown for selecting solution generations is visible.   |
| searchText                    | String  | Text used for searching solutions.                                          |
| activeFilteredSolutionIndex   | Number  | Index of the currently active solution after filtering.                     |
| isSearchVisible               | Boolean | Indicates if the search input is visible.                                   |
| hideExtraSolutionInformation  | Boolean | Controls the visibility of additional solution information.                 |
| isLoadingMiddle               | Boolean | Indicates if the middle data for solutions is being loaded.                 |
| groupListScrollPositionY      | Number  | Y-axis scroll position of the group list.                                   |
| lastKeys                      | any[]   | Stores the last pressed keys to detect specific key combinations.           |
| findBarProbablyOpen           | Boolean | Indicates if the find bar is likely open based on key inputs.               |
| touchStartX                   | Number  | X-axis start position for touch events.                                     |
| minSwipeDistance              | Number  | Minimum distance in pixels to consider a touch movement a swipe.            |
| solutionListScrollPositionX   | Number  | X-axis scroll position of the solution list.                                |
| solutionListScrollPositionY   | Number  | Y-axis scroll position of the solution list.                                |

## Methods

| Name                      | Parameters                  | Return Type | Description                                                                                   |
|---------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleGroupButtonClick    | groupIndex: number          | Promise<void> | Handles click events on group buttons to filter solutions by groups.                          |
| reset                     |                             | void        | Resets the component to its initial state.                                                    |
| connectedCallback         |                             | void        | Lifecycle method called when the component is added to the document’s DOM.                    |
| disconnectedCallback      |                             | void        | Lifecycle method called when the component is removed from the document’s DOM.                |
| updateSwipeIndex          | direction: string           | void        | Updates the index of the active solution based on swipe direction.                            |
| loadMiddleData            |                             | Promise<void> | Loads middle data for solutions asynchronously.                                               |
| handleKeyDown             | e: KeyboardEvent            | void        | Handles key down events for navigation and actions within the component.                      |
| exitSolutionScreen        |                             | void        | Handles the exit action from the solution detail screen.                                       |
| handleTouchStart          | e: TouchEvent               | void        | Handles the start of a touch event for swipe actions.                                          |
| handleTouchEnd            | e: TouchEvent               | void        | Handles the end of a touch event for swipe actions.                                            |
| updated                   | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component’s properties have been updated.                   |
| toggleSearchVisibility    |                             | void        | Toggles the visibility of the search input.                                                    |
| handleSearchBlur          |                             | void        | Handles the blur event on the search input field.                                              |
| handleDropdownChange      | e: Event                    | void        | Handles changes in the dropdown selection for solution generations.                            |
| toggleDropdownVisibility  |                             | Promise<void> | Toggles the visibility of the dropdown for selecting solution generations.                     |
| resetDropdown             |                             | void        | Resets the dropdown to its initial state.                                                      |
| camelCaseToRegular        | text: string                | string      | Converts camelCase text to regular sentence case.                                              |
| renderRatings             | solution: IEngineSolution   | TemplateResult | Renders the ratings section for a solution.                                                    |
| renderSolutionNavigationButtons | solutionIndex: number, solutions: IEngineSolution[] | TemplateResult | Renders navigation buttons for moving between solutions.                                       |
| getSolutionImgHeight      |                             | number      | Returns the height for solution images based on the screen width.                              |
| getSolutionImgWidth       |                             | number      | Returns the width for solution images based on the screen width.                               |
| renderSolutionImage       | solution: IEngineSolution   | TemplateResult | Renders the image for a solution.                                                              |
| renderSolutionScreen      | solutionIndex: number       | TemplateResult | Renders the detailed view for a specific solution.                                             |

## Example

```typescript
import { PsSolutions } from '@policysynth/webapp/policies/ps-solutions.js';

// Example of using PsSolutions
const psSolutions = document.createElement('ps-solutions');
document.body.appendChild(psSolutions);

// Example of setting properties
psSolutions.isDropdownVisible = true;
psSolutions.searchText = 'sustainable energy';
```