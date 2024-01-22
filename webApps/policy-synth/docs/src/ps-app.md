# PolicySynthWebApp

The PolicySynthWebApp is a web component that serves as the main application for the Policy Synth platform. It manages the user interface, routing, and state of the application, including the current project, active indexes for sub-problems, populations, solutions, and policies, as well as the theme and appearance settings.

## Properties

| Name                        | Type                                  | Description                                                                 |
|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| currentProjectId            | number \| undefined                   | The ID of the current project being viewed or edited.                        |
| activeSubProblemIndex       | number \| undefined                   | The index of the active sub-problem within the current project.              |
| activePopulationIndex       | number \| undefined                   | The index of the active population within the current sub-problem.           |
| activeSolutionIndex         | number \| undefined                   | The index of the active solution within the current population.              |
| activePolicyIndex           | number \| undefined                   | The index of the active policy within the current population.                |
| pageIndex                   | number                                | The index of the current page being displayed.                               |
| currentMemory               | IEngineInnovationMemoryData \| undefined | The current memory state of the engine.                                      |
| totalNumberOfVotes          | number                                | The total number of votes cast in the application.                           |
| showAllCosts                | boolean                               | A flag indicating whether to show all costs associated with the application. |
| lastSnackbarText            | string \| undefined                   | The text of the last snackbar notification displayed.                       |
| collectionType              | string                                | The type of collection being managed.                                        |
| earlName                    | string                                | The name of the EARL (Easy Accessible Richly Linked) data.                   |
| currentError                | string \| undefined                   | The current error message, if any.                                           |
| forceGetBackupForProject    | string \| undefined                   | A flag to force getting a backup for the project.                            |
| tempPassword                | string \| undefined                   | A temporary password for accessing the project.                              |
| themeColor                  | string                                | The primary color of the application theme.                                  |
| themePrimaryColor           | string                                | The primary color used in the theme.                                         |
| themeSecondaryColor         | string                                | The secondary color used in the theme.                                       |
| themeTertiaryColor          | string                                | The tertiary color used in the theme.                                        |
| themeNeutralColor           | string                                | The neutral color used in the theme.                                         |
| themeScheme                 | Scheme                                | The color scheme used in the theme.                                          |
| themeHighContrast           | boolean                               | A flag indicating whether the theme is in high contrast mode.                |
| isAdmin                     | boolean                               | A flag indicating whether the current user is an admin.                      |
| surveyClosed                | boolean                               | A flag indicating whether the survey is closed.                              |
| appearanceLookup            | string                                | A string used to look up the appearance settings.                            |
| currentLeftAnswer           | string                                | The current left answer in a survey or poll.                                 |
| currentRightAnswer          | string                                | The current right answer in a survey or poll.                                |
| numberOfSolutionsGenerations | number                                | The number of generations of solutions created.                              |
| numberOfPoliciesIdeasGeneration | number                                | The number of generations of policy ideas created.                           |
| totalSolutions              | number                                | The total number of solutions generated.                                     |
| totalPros                   | number                                | The total number of pros associated with solutions.                          |
| totalCons                   | number                                | The total number of cons associated with solutions.                          |

## Methods

| Name                        | Parameters                           | Return Type | Description                                                                 |
|-----------------------------|--------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderSolutionPage          |                                      | TemplateResult | Renders the solutions page.                                                  |
| renderPoliciesPage          |                                      | TemplateResult | Renders the policies page.                                                  |
| setupCurrentProjectFromRoute | newProjectId: number, clearAll: boolean | void        | Sets up the current project based on the route.                              |
| parseAllActiveIndexes       | params: any                          | void        | Parses all active indexes from the route parameters.                         |
| renderCrtPage               | treeId: string \| undefined         | TemplateResult | Renders the CRT (Causal Relationship Tree) page.                             |
| renderWebResearchPage       |                                      | TemplateResult | Renders the web research page.                                               |
| getServerUrlFromClusterId   | clusterId: number                    | string      | Returns the server URL based on the cluster ID.                              |
| openTempPassword            |                                      | void        | Opens the temporary password dialog.                                         |
| boot                        |                                      | Promise<void> | Boots the application by fetching project data.                              |
| themeChanged                | target: HTMLElement \| undefined    | void        | Applies the theme changes to the application.                                |
| snackbarclosed              |                                      | void        | Handles the closing of the snackbar.                                         |
| tabChanged                  | event: CustomEvent                   | void        | Handles the change of tabs in the navigation bar.                             |
| mobileTabChanged            | event: CustomEvent                   | void        | Handles the change of tabs in the mobile navigation bar.                      |
| exitToMainApp               |                                      | void        | Exits to the main application.                                               |
| updateActiveSolutionIndexes | event: CustomEvent                   | Promise<void> | Updates the active solution indexes based on an event.                        |
| updateActivePolicyIndexes   | event: CustomEvent                   | Promise<void> | Updates the active policy indexes based on an event.                          |
| updatePoliciesRouter        |                                      | Promise<void> | Updates the router to reflect the current policies page.                      |
| updateSolutionsRouter       |                                      | Promise<void> | Updates the router to reflect the current solutions page.                     |
| renderCrtPage               | treeId: string \| undefined         | TemplateResult | Renders the CRT (Causal Relationship Tree) page.                             |
| renderWebResearchPage       |                                      | TemplateResult | Renders the web research page.                                               |
| getServerUrlFromClusterId   | clusterId: number                    | string      | Returns the server URL based on the cluster ID.                              |
| openTempPassword            |                                      | void        | Opens the temporary password dialog.                                         |
| boot                        |                                      | Promise<void> | Boots the application by fetching project data.                              |
| themeChanged                | target: HTMLElement \| undefined    | void        | Applies the theme changes to the application.                                |
| snackbarclosed              |                                      | void        | Handles the closing of the snackbar.                                         |
| tabChanged                  | event: CustomEvent                   | void        | Handles the change of tabs in the navigation bar.                             |
| mobileTabChanged            | event: CustomEvent                   | void        | Handles the change of tabs in the mobile navigation bar.                      |
| exitToMainApp               |                                      | void        | Exits to the main application.                                               |
| updateActiveSolutionIndexes | event: CustomEvent                   | Promise<void> | Updates the active solution indexes based on an event.                        |
| updateActivePolicyIndexes   | event: CustomEvent                   | Promise<void> | Updates the active policy indexes based on an event.                          |
| updatePoliciesRouter        |                                      | Promise<void> | Updates the router to reflect the current policies page.                      |
| updateSolutionsRouter       |                                      | Promise<void> | Updates the router to reflect the current solutions page.                     |

## Events

- **app-error**: Emitted when an application error occurs.
- **display-snackbar**: Emitted to display a snackbar notification.
- **toggle-dark-mode**: Emitted to toggle the dark mode of the theme.
- **toggle-high-contrast-mode**: Emitted to toggle the high contrast mode of the theme.

## Examples

```typescript
// Example usage of the PolicySynthWebApp
<ps-app></ps-app>
```

Note: The above documentation is a high-level overview of the PolicySynthWebApp class and does not cover all properties, methods, and events. The actual implementation may include additional functionality and complexity.