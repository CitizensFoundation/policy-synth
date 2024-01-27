# PsPolicies

`PsPolicies` is a custom element that extends `PsStageBase` to manage and display policies within a policy synthesis web application. It provides functionalities such as displaying a list of policies, filtering policies based on search criteria, handling policy group interactions, and navigating through policies.

## Properties

| Name                        | Type    | Description                                                                 |
|-----------------------------|---------|-----------------------------------------------------------------------------|
| isDropdownVisible           | Boolean | Indicates if the dropdown for selecting policy generations is visible.     |
| searchText                  | String  | The text used for filtering policies based on their titles and descriptions.|
| activeFilteredPolicyIndex   | Number  | The index of the currently active policy after filtering.                   |
| isSearchVisible             | Boolean | Indicates if the search input field is visible.                             |
| hideExtraPolicyInformation  | Boolean | Determines whether to hide additional policy information.                   |
| groupListScrollPositionY    | Number  | The vertical scroll position of the group list.                             |
| lastKeys                    | any[]   | Stores the last pressed keys to detect specific key combinations.           |
| findBarProbablyOpen         | Boolean | Indicates if the find bar is likely open based on key presses.              |
| touchStartX                 | Number  | The starting X position of a touch event for swipe detection.               |
| minSwipeDistance            | Number  | The minimum distance to consider a touch movement as a swipe.               |
| policyListScrollPositionX   | Number  | The horizontal scroll position of the policy list.                          |
| policyListScrollPositionY   | Number  | The vertical scroll position of the policy list.                            |

## Methods

| Name                    | Parameters                | Return Type | Description                                                                 |
|-------------------------|---------------------------|-------------|-----------------------------------------------------------------------------|
| updateRoutes            | None                      | void        | Updates the application route based on the current policy navigation state. |
| setSubProblem           | index: number             | void        | Sets the active sub-problem to the specified index.                         |
| handleGroupButtonClick  | groupIndex: number        | Promise<void>| Handles click events on policy group buttons.                                |
| reset                   | None                      | void        | Resets the component to its initial state.                                  |
| connectedCallback       | None                      | void        | Lifecycle callback that runs when the element is added to the document.    |
| disconnectedCallback    | None                      | void        | Lifecycle callback that runs when the element is removed from the document. |
| updateSwipeIndex        | direction: string         | void        | Updates the index of the active policy based on swipe direction.            |
| handleKeyDown           | e: KeyboardEvent          | void        | Handles key down events for navigation and interaction.                     |
| exitPolicyScreen        | None                      | void        | Handles the exit action from the policy detail screen.                      |
| handleTouchStart        | e: TouchEvent             | void        | Handles the start of a touch event for swipe detection.                     |
| handleTouchEnd          | e: TouchEvent             | void        | Handles the end of a touch event for swipe detection.                       |
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs after the element’s properties have changed.  |
| toggleSearchVisibility  | None                      | void        | Toggles the visibility of the search input field.                           |
| handleSearchBlur        | None                      | void        | Handles the blur event of the search input field.                           |
| handleDropdownChange    | e: Event                  | void        | Handles changes in the dropdown for selecting policy generations.           |
| toggleDropdownVisibility| None                      | void        | Toggles the visibility of the dropdown for selecting policy generations.    |
| resetDropdown           | None                      | void        | Resets the dropdown to its initial state.                                   |
| camelCaseToRegular      | text: string              | string      | Converts camelCase text to regular sentence case.                           |
| renderRatings           | policy: PSPolicy          | TemplateResult | Renders the ratings section for a policy.                                   |
| renderPolicyNavigationButtons | policyIndex: number, policies: PSPolicy[] | TemplateResult | Renders navigation buttons for policy detail view.                          |
| getPolicyImgHeight      | None                      | number      | Returns the height for policy images based on the screen width.             |
| getPolicyImgWidth       | None                      | number      | Returns the width for policy images based on the screen width.              |
| renderPolicyImage       | policy: PSPolicy          | TemplateResult | Renders the image for a policy.                                             |
| renderPolicyScreen      | policyIndex: number       | TemplateResult | Renders the policy detail screen for the specified policy index.            |

## Events

This component fires custom events such as `update-route`, `yp-theme-color`, and various activity tracking events using `window.psAppGlobals.activity`.

## Example

```typescript
import '@policysynth/webapp/policies/ps-policies.js';

// Example of using the PsPolicies element in HTML
<ps-policies></ps-policies>
```

This example demonstrates how to import and use the `PsPolicies` custom element within a web application.