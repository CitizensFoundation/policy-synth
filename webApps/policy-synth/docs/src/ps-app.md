# PolicySynthWebApp

This class represents the main web application for Policy Synth. It manages the application's state, including the current project, active indexes for sub-problems, populations, solutions, and policies. It also handles the rendering of different pages based on the application's state and user interactions.

## Properties

| Name                        | Type                                      | Description                                                                 |
|-----------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| currentProjectId            | number \| undefined                       | The ID of the current project.                                               |
| activeSubProblemIndex       | number \| undefined                       | The index of the active sub-problem.                                         |
| activePopulationIndex       | number \| undefined                       | The index of the active population.                                          |
| activeSolutionIndex         | number \| undefined                       | The index of the active solution.                                            |
| activePolicyIndex           | number \| undefined                       | The index of the active policy.                                              |
| pageIndex                   | number                                    | The index of the current page.                                               |
| currentMemory               | IEngineInnovationMemoryData \| undefined  | The current memory data from the engine.                                      |
| totalNumberOfVotes          | number                                    | The total number of votes.                                                   |
| showAllCosts                | boolean                                   | Flag to show all costs.                                                      |
| lastSnackbarText            | string \| undefined                       | The text for the last snackbar message.                                      |
| collectionType              | string                                    | The type of collection.                                                      |
| earlName                    | string                                    | The name of the EARL.                                                        |
| currentError                | string \| undefined                       | The current error message.                                                   |
| forceGetBackupForProject    | string \| undefined                       | Force getting a backup for the project.                                      |
| tempPassword                | string \| undefined                       | Temporary password for accessing the project.                                |
| localStorageThemeColorKey   | string                                    | The local storage key for the theme color.                                   |
| themeColor                  | string                                    | The theme color.                                                             |
| themePrimaryColor           | string                                    | The primary theme color.                                                     |
| themeSecondaryColor         | string                                    | The secondary theme color.                                                   |
| themeTertiaryColor          | string                                    | The tertiary theme color.                                                    |
| themeNeutralColor           | string                                    | The neutral theme color.                                                     |
| themeScheme                 | Scheme                                    | The theme scheme.                                                            |
| themeHighContrast           | boolean                                   | Flag for high contrast theme.                                                |
| isAdmin                     | boolean                                   | Flag indicating if the user is an admin.                                     |
| surveyClosed                | boolean                                   | Flag indicating if the survey is closed.                                     |
| appearanceLookup            | string                                    | The appearance lookup string.                                                |
| currentLeftAnswer           | string                                    | The current left answer.                                                     |
| currentRightAnswer          | string                                    | The current right answer.                                                    |
| numberOfSolutionsGenerations| number                                    | The number of solutions generations.                                         |
| numberOfPoliciesIdeasGeneration| number                                | The number of policies ideas generation.                                     |
| totalSolutions              | number                                    | The total number of solutions.                                               |
| totalPros                   | number                                    | The total number of pros.                                                    |
| totalCons                   | number                                    | The total number of cons.                                                    |
| drawer                      | MdNavigationDrawer                        | The navigation drawer component.                                             |

## Methods

| Name                          | Parameters                               | Return Type | Description                                       |
|-------------------------------|------------------------------------------|-------------|---------------------------------------------------|
| renderSolutionPage            |                                          | TemplateResult | Renders the solution page.                        |
| renderPoliciesPage            |                                          | TemplateResult | Renders the policies page.                        |
| setupCurrentProjectFromRoute  | newProjectId: number, clearAll: boolean  | void        | Sets up the current project from the route.       |
| parseAllActiveIndexes         | params: any                              | void        | Parses all active indexes from the route params.  |
| renderCrtPage                 | treeId: string \| undefined              | TemplateResult | Renders the CRT page.                             |
| renderWebResearchPage         |                                          | TemplateResult | Renders the web research page.                    |
| getServerUrlFromClusterId     | clusterId: number                        | string      | Gets the server URL from the cluster ID.          |
| openTempPassword              |                                          | void        | Opens the temporary password dialog.              |
| boot                          |                                          | Promise<void> | Boots the application.                            |
| themeChanged                  | target: HTMLElement \| undefined         | void        | Applies the theme changes.                        |
| snackbarclosed                |                                          | void        | Handles the snackbar closed event.                |
| tabChanged                    | event: CustomEvent                       | void        | Handles the tab changed event.                    |
| mobileTabChanged              | event: CustomEvent                       | void        | Handles the mobile tab changed event.             |
| exitToMainApp                 |                                          | void        | Exits to the main application.                    |
| _displaySnackbar              | event: CustomEvent                       | void        | Displays a snackbar with a message.               |
| _setupEventListeners          |                                          | void        | Sets up event listeners.                          |
| _removeEventListeners         |                                          | void        | Removes event listeners.                          |
| updateActiveSolutionIndexes   | event: CustomEvent                       | Promise<void> | Updates active solution indexes.                  |
| updateActivePolicyIndexes     | event: CustomEvent                       | Promise<void> | Updates active policy indexes.                    |
| updatePoliciesRouter          |                                          | Promise<void> | Updates the router for policies.                  |
| updateSolutionsRouter         |                                          | Promise<void> | Updates the router for solutions.                 |
| updated                       | changedProperties: Map<string \| number \| symbol, unknown> | void | Handles updates to properties. |
| _appError                     | event: CustomEvent                       | void        | Handles application errors.                       |
| adminConfirmed                |                                          | boolean     | Checks if the admin is confirmed.                 |
| _settingsColorChanged         | event: CustomEvent                       | void        | Handles settings color change.                    |
| changeTabTo                   | tabId: number                            | void        | Changes the active tab.                           |
| updateThemeColor              | event: CustomEvent                       | void        | Updates the theme color.                          |
| sendVoteAnalytics             |                                          | void        | Sends vote analytics.                             |
| renderIntroduction            |                                          | TemplateResult | Renders the introduction.                         |
| renderShare                   |                                          | TemplateResult | Renders the share section.                        |
| toggleDarkMode                |                                          | void        | Toggles the dark mode theme.                      |
| toggleHighContrastMode        |                                          | void        | Toggles the high contrast mode theme.             |
| setupTheme                    |                                          | void        | Sets up the theme based on local storage.         |
| startVoting                   |                                          | void        | Starts the voting process.                        |
| openResults                   |                                          | void        | Opens the results page.                           |
| openAnalytics                 |                                          | void        | Opens the analytics page.                         |
| goToAdmin                     |                                          | void        | Goes to the admin page.                           |
| openGitHub                    |                                          | void        | Opens the GitHub page.                            |
| renderStats                   |                                          | TemplateResult | Renders the statistics.                           |
| renderCosts                   |                                          | TemplateResult | Renders the costs.                                |
| renderContentOrLoader         | content: TemplateResult                  | TemplateResult | Renders content or a loader.                      |
| handleShowMore                | event: CustomEvent                       | void        | Handles the show more event for costs.            |
| getCustomVersion              | version: string                          | string      | Gets a custom version string.                     |
| renderThemeToggle             | hideText: boolean                        | TemplateResult | Renders the theme toggle buttons.                 |
| renderLogo                    |                                          | TemplateResult | Renders the application logo.                     |
| openSolutions                 |                                          | Promise<void> | Opens the solutions page.                         |
| openPolicies                  |                                          | Promise<void> | Opens the policies page.                          |
| openWebResearch               |                                          | void        | Opens the web research page.                      |
| renderNavigationBar           |                                          | TemplateResult | Renders the navigation bar.                       |
| submitTempPassword            |                                          | void        | Submits the temporary password.                   |
| renderTempLoginDialog         |                                          | TemplateResult | Renders the temporary login dialog.               |
| render                        |                                          | TemplateResult | Renders the application.                          |

## Example

```typescript
import { PolicySynthWebApp } from '@policysynth/webapp/ps-app.js';

// Example usage in a LitElement
html`<ps-app></ps-app>`;
```

This documentation provides a comprehensive overview of the `PolicySynthWebApp` class, including its properties, methods, and how it can be used within a web application.