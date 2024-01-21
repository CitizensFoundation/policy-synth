# PsPolicies

`PsPolicies` is a custom element that extends `CpsStageBase` and is responsible for displaying and managing policies within a problem-solving application. It allows users to view, filter, and navigate through different generations of policies related to sub-problems.

## Properties

| Name                        | Type    | Description                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible           | Boolean | Indicates if the dropdown for selecting policy generations is visible.      |
| searchText                  | String  | The current text used for filtering policies.                               |
| activeFilteredPolicyIndex   | Number  | The index of the currently active policy after filtering.                   |
| isSearchVisible             | Boolean | Indicates if the search input for filtering policies is visible.            |
| hideExtraPolicyInformation  | Boolean | Determines whether to hide additional information about policies.           |
| groupListScrollPositionY    | Number  | The Y-axis scroll position of the group list.                               |
| lastKeys                    | any[]   | An array storing the last keys pressed, used for detecting certain actions. |
| findBarProbablyOpen         | Boolean | Indicates if the find bar is likely open based on key presses.              |
| touchStartX                 | Number  | The starting X-axis position for touch events.                              |
| minSwipeDistance            | Number  | The minimum distance for a swipe gesture to be recognized.                   |
| policyListScrollPositionX   | Number  | The X-axis scroll position of the policy list.                              |
| policyListScrollPositionY   | Number  | The Y-axis scroll position of the policy list.                              |

## Methods

| Name                    | Parameters        | Return Type | Description                                                                                   |
|-------------------------|-------------------|-------------|-----------------------------------------------------------------------------------------------|
| updateRoutes            | None              | void        | Updates the application's routing based on the current policy and sub-problem indices.        |
| setSubProblem           | index: number     | void        | Sets the active sub-problem to the one at the specified index.                                |
| handleGroupButtonClick  | groupIndex: number| Promise<void>| Handles the logic for when a group button is clicked, toggling the active group filter.       |
| reset                   | None              | void        | Resets the component's state, clearing filters and selections.                                |
| connectedCallback       | None              | void        | Lifecycle callback that runs when the element is added to the document's DOM.                 |
| disconnectedCallback    | None              | void        | Lifecycle callback that runs when the element is removed from the document's DOM.             |
| updateSwipeIndex        | direction: string | void        | Updates the index of the active policy or sub-problem based on swipe direction.               |
| handleKeyDown           | e: KeyboardEvent  | void        | Handles keydown events for navigation and interaction within the component.                   |
| exitPolicyScreen        | None              | void        | Handles the logic for exiting the detailed policy screen.                                     |
| handleTouchStart        | e: TouchEvent     | void        | Records the starting X position when a touch event begins.                                    |
| handleTouchEnd          | e: TouchEvent     | void        | Handles the end of a touch event, determining if a swipe action occurred.                     |
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs after the element's properties have changed.                    |

## Events

- **update-route**: Emitted when the route needs to be updated based on the active indices.
- **yp-theme-color**: Emitted to update the theme color based on the active sub-problem.

## Examples

```typescript
// Example usage of the PsPolicies component
const psPolicies = document.createElement('ps-policies');
document.body.appendChild(psPolicies);

// Set a sub-problem by index
psPolicies.setSubProblem(2);

// Handle a group button click to filter policies by a group index
psPolicies.handleGroupButtonClick(1);

// Reset the component to clear filters and selections
psPolicies.reset();

// Add event listeners for custom events
psPolicies.addEventListener('update-route', (event) => {
  console.log('Route should be updated:', event.detail);
});

psPolicies.addEventListener('yp-theme-color', (event) => {
  console.log('Theme color should be updated:', event.detail);
});
```

Note: The provided code is a TypeScript class definition for a custom web component that extends `CpsStageBase`. It includes properties, methods, and event handling related to the display and management of policies within a problem-solving context. The component uses LitElement decorators for defining properties and custom element metadata. It also integrates with other custom elements and Material Web Components for UI interactions.