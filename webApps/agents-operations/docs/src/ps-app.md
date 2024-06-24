# PolicySynthWebApp

This class represents the main application component for the Policy Synth web application. It extends `YpBaseElement` to leverage shared functionality across components. The class is decorated with `@customElement('ps-app')` to define a custom element.

## Properties

| Name                        | Type                              | Description                                                                 |
|-----------------------------|-----------------------------------|-----------------------------------------------------------------------------|
| currentProjectId            | number \| undefined               | The ID of the current project.                                              |
| activeSubProblemIndex       | number \| undefined               | The index of the active sub-problem.                                        |
| activePopulationIndex       | number \| undefined               | The index of the active population.                                         |
| activeSolutionIndex         | number \| undefined               | The index of the active solution.                                           |
| activePolicyIndex           | number \| undefined               | The index of the active policy.                                             |
| pageIndex                   | number                            | The index of the current page.                                              |
| currentMemory               | PsSmarterCrowdsourcingMemoryData \| undefined     | The current memory data.                                                    |
| totalNumberOfVotes          | number                            | The total number of votes.                                                  |
| showAllCosts                | boolean                           | Flag to show all costs.                                                     |
| lastSnackbarText            | string \| undefined               | The text of the last snackbar.                                              |
| collectionType              | string                            | The type of the collection.                                                 |
| earlName                    | string                            | The name of the EARL.                                                       |
| currentError                | string \| undefined               | The current error message.                                                  |
| forceGetBackupForProject    | string \| undefined               | Forces getting a backup for the project.                                    |
| tempPassword                | string \| undefined               | Temporary password for accessing the project.                               |
| localStorageThemeColorKey   | string                            | The local storage key for the theme color.                                  |
| themeColor                  | string                            | The theme color.                                                            |
| themePrimaryColor           | string                            | The primary theme color.                                                    |
| themeSecondaryColor         | string                            | The secondary theme color.                                                  |
| themeTertiaryColor          | string                            | The tertiary theme color.                                                   |
| themeNeutralColor           | string                            | The neutral theme color.                                                    |
| themeScheme                 | Scheme                            | The theme scheme.                                                           |
| themeHighContrast           | boolean                           | Flag for high contrast theme.                                               |
| isAdmin                     | boolean                           | Flag indicating if the user is an admin.                                    |
| surveyClosed                | boolean                           | Flag indicating if the survey is closed.                                    |
| appearanceLookup            | string                            | The appearance lookup string.                                               |
| currentLeftAnswer           | string                            | The current left answer.                                                    |
| currentRightAnswer          | string                            | The current right answer.                                                   |
| numberOfSolutionsGenerations| number                            | The number of solutions generations.                                        |
| numberOfPoliciesIdeasGeneration| number                         | The number of policies ideas generation.                                    |
| totalSolutions              | number                            | The total number of solutions.                                              |
| totalPros                   | number                            | The total number of pros.                                                   |
| totalCons                   | number                            | The total number of cons.                                                   |
| drawer                      | MdNavigationDrawer                | The navigation drawer component.                                            |

## Methods

- `setupDebugScroll()`: Sets up debug scrolling functionality.
- `renderSolutionPage()`: Renders the solution page.
- `renderPoliciesPage()`: Renders the policies page.
- `setupCurrentProjectFromRoute(newProjectId: number, clearAll = false)`: Sets up the current project from the route.
- `parseAllActiveIndexes(params: any)`: Parses all active indexes from the route parameters.
- `renderCrtPage(treeId: string | undefined = undefined)`: Renders the CRT page.
- `renderWebResearchPage()`: Renders the web research page.
- `getServerUrlFromClusterId(clusterId: number)`: Gets the server URL from the cluster ID.
- `openTempPassword()`: Opens the temporary password dialog.
- `boot()`: Boots the application.
- `themeChanged(target: HTMLElement | undefined = undefined)`: Changes the theme.
- `snackbarclosed()`: Handles the snackbar closed event.
- `tabChanged(event: CustomEvent)`: Handles tab changes.
- `mobileTabChanged(event: CustomEvent)`: Handles mobile tab changes.
- `exitToMainApp()`: Exits to the main application.
- `_displaySnackbar(event: CustomEvent)`: Displays a snackbar.
- `_setupEventListeners()`: Sets up event listeners.
- `_removeEventListeners()`: Removes event listeners.
- `updateActiveSolutionIndexes(event: CustomEvent)`: Updates active solution indexes.
- `updateActivePolicyIndexes(event: CustomEvent)`: Updates active policy indexes.
- `updatePoliciesRouter()`: Updates the policies router.
- `updateSolutionsRouter()`: Updates the solutions router.
- `updated(changedProperties: Map<string | number | symbol, unknown>)`: Called when the component is updated.
- `_appError(event: CustomEvent)`: Handles application errors.
- `_settingsColorChanged(event: CustomEvent)`: Handles settings color changes.

## Events

This class listens for various custom events such as `app-error`, `display-snackbar`, `toggle-dark-mode`, and `toggle-high-contrast-mode`.

## Example

```typescript
import '@policysynth/webapp/ps-app.js';

// Usage in HTML
<ps-app></ps-app>
```

This example shows how to import and use the `PolicySynthWebApp` component in a web application.