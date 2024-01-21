# PsPolicies

The `PsPolicies` class is a custom element that extends the `CpsStageBase` class. It is responsible for displaying and managing the policies within a problem-solving stage. The component allows users to filter, search, and navigate through different generations of policies, view detailed information about each policy, and interact with policy groups.

## Properties

| Name                        | Type    | Description                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible           | Boolean | Indicates whether the dropdown for generations is visible.                  |
| searchText                  | String  | The current text used for filtering policies by title or description.       |
| activeFilteredPolicyIndex   | Number  | The index of the currently active policy after filtering.                   |
| isSearchVisible             | Boolean | Indicates whether the search input is visible.                              |
| hideExtraPolicyInformation  | Boolean | Determines whether to hide additional policy information.                   |
| groupListScrollPositionY    | Number  | The Y scroll position of the group list.                                    |
| lastKeys                    | any[]   | An array storing the last pressed keys to detect certain key combinations.  |
| findBarProbablyOpen         | Boolean | Indicates whether the find bar is likely open based on key presses.         |
| touchStartX                 | Number  | The starting X position of a touch event for swipe detection.               |
| minSwipeDistance            | Number  | The minimum distance to consider a touch movement a swipe.                  |
| policyListScrollPositionX   | Number  | The X scroll position of the policy list.                                   |
| policyListScrollPositionY   | Number  | The Y scroll position of the policy list.                                   |

## Methods

| Name                    | Parameters        | Return Type | Description                                                                 |
|-------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| updateRoutes            | None              | void        | Updates the routes based on the current active indices.                     |
| setSubProblem           | index: number     | void        | Sets the active sub-problem index and updates the scroll positions.         |
| handleGroupButtonClick  | groupIndex: number| Promise<void>| Handles the click event on a group button, toggling the group filter.      |
| reset                   | None              | void        | Resets the search text, visibility flags, and active indices.               |
| connectedCallback       | None              | Promise<void>| Lifecycle method called when the element is added to the document.         |
| disconnectedCallback    | None              | void        | Lifecycle method called when the element is removed from the document.      |
| updateSwipeIndex        | direction: string | void        | Updates the index of the active policy based on swipe direction.            |
| handleKeyDown           | e: KeyboardEvent  | void        | Handles key down events for navigation and interaction.                     |
| exitPolicyScreen        | None              | void        | Handles the exit action from the policy detail screen.                      |
| handleTouchStart        | e: TouchEvent     | void        | Handles the start of a touch event for swipe detection.                     |
| handleTouchEnd          | e: TouchEvent     | void        | Handles the end of a touch event for swipe detection.                       |
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element’s properties have changed.    |

## Events

- **update-route**: Emitted when the route needs to be updated based on the active indices.
- **yp-theme-color**: Emitted to update the theme color based on the active sub-problem index.

## Examples

```typescript
// Example usage of the PsPolicies custom element
<ps-policies></ps-policies>
```

Note: The above example is a simple usage scenario. The actual usage would involve setting up the necessary properties and handling events to integrate the `PsPolicies` component into a larger application.