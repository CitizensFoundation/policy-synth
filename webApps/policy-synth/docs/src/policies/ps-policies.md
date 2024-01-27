# PsPolicies

This class extends `PsStageBase` and represents the policies component in the application. It is responsible for displaying and managing policies, including filtering, searching, and navigating through policies and sub-problems.

## Properties

| Name                        | Type    | Description                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible           | Boolean | Indicates if the dropdown is visible.                                       |
| searchText                  | String  | The current text used for searching policies.                               |
| activeFilteredPolicyIndex   | Number  | The index of the currently active filtered policy.                          |
| isSearchVisible             | Boolean | Indicates if the search input is visible.                                   |
| hideExtraPolicyInformation  | Boolean | Determines whether to hide extra policy information.                        |
| groupListScrollPositionY    | Number  | The Y position of the scroll in the group list.                             |
| lastKeys                    | any[]   | Stores the last keys pressed, used for detecting specific key combinations. |
| findBarProbablyOpen         | Boolean | Indicates if the find bar is probably open based on key presses.            |
| touchStartX                 | Number  | The starting X position of a touch event.                                   |
| minSwipeDistance            | Number  | The minimum distance to consider a swipe gesture.                           |
| policyListScrollPositionX   | Number  | The X position of the scroll in the policy list.                            |
| policyListScrollPositionY   | Number  | The Y position of the scroll in the policy list.                            |

## Methods

| Name                    | Parameters                  | Return Type | Description                                                                 |
|-------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| updateRoutes            |                             | void        | Updates the routes based on the current indexes.                            |
| setSubProblem           | index: number               | void        | Sets the active sub-problem by its index.                                   |
| handleGroupButtonClick  | groupIndex: number          | Promise<void>| Handles the click event on a group button.                                  |
| reset                   |                             | void        | Resets the component to its initial state.                                  |
| connectedCallback       |                             | void        | Lifecycle method called when the component is added to the document.       |
| disconnectedCallback    |                             | void        | Lifecycle method called when the component is removed from the document.    |
| updateSwipeIndex        | direction: string           | void        | Updates the swipe index based on the swipe direction.                       |
| handleKeyDown           | e: KeyboardEvent            | void        | Handles key down events for navigation and actions.                         |
| exitPolicyScreen        |                             | void        | Handles the action to exit the policy screen.                               |
| handleTouchStart        | e: TouchEvent               | void        | Handles the start of a touch event.                                         |
| handleTouchEnd          | e: TouchEvent               | void        | Handles the end of a touch event.                                           |
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component has been updated.               |
| toggleSearchVisibility  |                             | void        | Toggles the visibility of the search input.                                 |
| handleSearchBlur        |                             | void        | Handles the blur event of the search input.                                 |
| handleDropdownChange    | e: Event                    | void        | Handles the change event of the dropdown.                                   |
| toggleDropdownVisibility|                             | void        | Toggles the visibility of the dropdown.                                     |
| resetDropdown           |                             | void        | Resets the dropdown to its initial state.                                   |
| camelCaseToRegular      | text: string                | string      | Converts a camelCase string to regular text.                                |
| renderRatings           | policy: PSPolicy            | TemplateResult | Renders the ratings for a policy.                                           |
| renderPolicyNavigationButtons | policyIndex: number, policies: PSPolicy[] | TemplateResult | Renders navigation buttons for policy navigation.                           |
| getPolicyImgHeight      |                             | number      | Returns the height for policy images.                                       |
| getPolicyImgWidth       |                             | number      | Returns the width for policy images.                                        |
| renderPolicyImage       | policy: PSPolicy            | TemplateResult | Renders the image for a policy.                                             |
| renderPolicyScreen      | policyIndex: number         | TemplateResult | Renders the policy screen for a given policy index.                         |

## Events

This component fires the following custom events:

- `update-route`: Fired when the route needs to be updated based on the current indexes.
- `yp-theme-color`: Fired to update the theme color based on the sub-problem index.

## Example

```typescript
import '@policysynth/webapp/policies/ps-policies.js';

// Usage in a LitElement template
html`
  <ps-policies></ps-policies>
`;
```

This example demonstrates how to import and use the `ps-policies` component within a LitElement-based project.