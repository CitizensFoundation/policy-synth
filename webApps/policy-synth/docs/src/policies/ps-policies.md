# PsPolicies

`PsPolicies` is a custom element that extends `PsStageBase` and is responsible for displaying and managing policies within a problem-solving application. It allows users to view policies, filter them by generation, search, and navigate through policy details.

## Properties

| Name                        | Type    | Description                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible           | Boolean | Indicates if the dropdown for selecting policy generations is visible.      |
| searchText                  | String  | The current text used for filtering policies.                               |
| activeFilteredPolicyIndex   | Number  | The index of the currently active policy after filtering.                   |
| isSearchVisible             | Boolean | Indicates if the search input is visible.                                   |
| hideExtraPolicyInformation  | Boolean | Determines whether to hide additional policy information.                   |
| groupListScrollPositionY    | Number  | The Y scroll position of the group list.                                    |
| lastKeys                    | any[]   | An array storing the last pressed keys to detect certain key combinations.  |
| findBarProbablyOpen         | Boolean | A flag indicating if the find bar is likely open based on key presses.      |
| touchStartX                 | Number  | The X position where a touch event started.                                 |
| minSwipeDistance            | Number  | The minimum distance to consider a touch movement a swipe.                  |
| policyListScrollPositionX   | Number  | The X scroll position of the policy list.                                   |
| policyListScrollPositionY   | Number  | The Y scroll position of the policy list.                                   |

## Methods

| Name                    | Parameters        | Return Type | Description                                                                                   |
|-------------------------|-------------------|-------------|-----------------------------------------------------------------------------------------------|
| updateRoutes            | None              | void        | Updates the application's routing based on the current policy, sub-problem, and population.   |
| setSubProblem           | index: number     | void        | Sets the active sub-problem to the one at the specified index.                                |
| handleGroupButtonClick  | groupIndex: number| Promise<void>| Handles the logic when a group button is clicked, toggling the filter for that group.         |
| reset                   | None              | void        | Resets the search text, visibility flags, and active indices.                                 |
| connectedCallback       | None              | void        | Lifecycle callback that runs when the element is added to the DOM.                            |
| disconnectedCallback    | None              | void        | Lifecycle callback that runs when the element is removed from the DOM.                        |
| updateSwipeIndex        | direction: string | void        | Updates the index of the active policy or sub-problem based on swipe direction.               |
| handleKeyDown           | e: KeyboardEvent  | void        | Handles key down events for navigation and interaction within the component.                  |
| exitPolicyScreen        | None              | void        | Handles the logic to exit the policy detail screen.                                           |
| handleTouchStart        | e: TouchEvent     | void        | Records the start position of a touch event.                                                  |
| handleTouchEnd          | e: TouchEvent     | void        | Handles the end of a touch event to determine swipe actions.                                  |
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs after the element's properties have changed.                    |
| toggleSearchVisibility  | None              | void        | Toggles the visibility of the search input.                                                   |
| handleSearchBlur        | None              | void        | Handles the blur event on the search field, potentially hiding it if the search text is empty.|
| handleDropdownChange    | e: Event          | void        | Handles changes to the dropdown selection for policy generations.                             |
| toggleDropdownVisibility| None              | void        | Toggles the visibility of the dropdown for selecting policy generations.                      |
| resetDropdown           | None              | void        | Resets the dropdown to its default state.                                                     |
| camelCaseToRegular      | text: string      | string      | Converts a camelCase string to regular sentence case.                                         |
| renderRatings           | policy: PSPolicy  | TemplateResult | Renders the ratings for a given policy.                                                      |
| renderPolicyNavigationButtons | policyIndex: number, policies: PSPolicy[] | TemplateResult | Renders navigation buttons for policy detail view.                                           |
| getPolicyImgHeight      | None              | number      | Returns the height for policy images based on the current screen width.                       |
| getPolicyImgWidth       | None              | number      | Returns the width for policy images based on the current screen width.                        |
| renderPolicyImage       | policy: PSPolicy  | TemplateResult | Renders the image for a given policy.                                                        |
| renderPolicyScreen      | policyIndex: number | TemplateResult | Renders the detail view for a given policy.                                                  |

## Events

- **update-route**: Emitted when the route needs to be updated based on the active indices.
- **yp-theme-color**: Emitted when the theme color needs to be updated based on the active sub-problem.

## Examples

```typescript
// Example usage of the PsPolicies component
<ps-policies></ps-policies>
```

Note: The `PSPolicy` and `IEngineSubProblem` types are not defined in the provided context. They are assumed to be part of the application's type definitions.