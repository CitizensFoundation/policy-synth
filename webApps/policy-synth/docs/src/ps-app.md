# PolicySynthWebApp

This class represents the main web application for Policy Synth. It extends `YpBaseElement` to provide a comprehensive web interface for managing and interacting with policy synthesis processes. The application includes features such as project management, solution and policy generation, web research, and more, utilizing various components and APIs to facilitate these functionalities.

## Properties

| Name                        | Type                                              | Description                                                                 |
|-----------------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| currentProjectId            | number \| undefined                               | The ID of the current project being worked on.                              |
| activeSubProblemIndex       | number \| undefined                               | The index of the active sub-problem within the current project.             |
| activePopulationIndex       | number \| undefined                               | The index of the active population within the current sub-problem.          |
| activeSolutionIndex         | number \| undefined                               | The index of the active solution within the current population.             |
| activePolicyIndex           | number \| undefined                               | The index of the active policy within the current population.               |
| pageIndex                   | number                                            | The index of the current page being displayed.                              |
| currentMemory               | PsBaseMemoryData \| undefined          | The current memory state of the engine innovation process.                  |
| totalNumberOfVotes          | number                                            | The total number of votes cast in the current session.                      |
| showAllCosts                | boolean                                           | Flag to show all costs associated with the policy synthesis process.        |
| lastSnackbarText            | string \| undefined                               | The text to be displayed in the last snackbar message.                      |
| collectionType              | string                                            | The type of collection being managed.                                       |
| earlName                    | string                                            | The name associated with the EARL (Easy Accessible Rich Internet Applications) guidelines. |
| currentError                | string \| undefined                               | The current error message, if any.                                          |
| forceGetBackupForProject    | string \| undefined                               | A flag to force retrieval of backup for the project.                        |
| tempPassword                | string \| undefined                               | A temporary password for accessing certain features.                        |
| localStorageThemeColorKey   | string                                            | The local storage key for the theme color.                                  |
| themeColor                  | string                                            | The primary theme color.                                                    |
| themePrimaryColor           | string                                            | The primary color used in the theme.                                        |
| themeSecondaryColor         | string                                            | The secondary color used in the theme.                                      |
| themeTertiaryColor          | string                                            | The tertiary color used in the theme.                                       |
| themeNeutralColor           | string                                            | The neutral color used in the theme.                                        |
| themeScheme                 | Scheme                                            | The color scheme used in the theme.                                         |
| themeHighContrast           | boolean                                           | Flag to indicate if high contrast mode is enabled.                          |
| isAdmin                     | boolean                                           | Flag to indicate if the current user is an admin.                           |
| surveyClosed                | boolean                                           | Flag to indicate if the survey is closed.                                   |
| appearanceLookup            | string                                            | A string used for appearance lookup.                                        |
| currentLeftAnswer           | string                                            | The current left answer in a comparison or decision-making process.         |
| currentRightAnswer          | string                                            | The current right answer in a comparison or decision-making process.        |
| numberOfSolutionsGenerations| number                                            | The number of generations of solutions created.                             |
| numberOfPoliciesIdeasGeneration| number                                        | The number of generations of policy ideas created.                          |
| totalSolutions              | number                                            | The total number of solutions generated.                                    |
| totalPros                   | number                                            | The total number of pros associated with solutions.                         |
| totalCons                   | number                                            | The total number of cons associated with solutions.                         |
| drawer                      | MdNavigationDrawer                                | The navigation drawer component.                                            |
| router                      | PsRouter                                          | The router for managing application routes.                                 |

## Methods

| Name                          | Parameters                                      | Return Type | Description                                                                 |
|-------------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderSolutionPage            |                                                 | TemplateResult | Renders the solutions page.                                                  |
| renderPoliciesPage            |                                                 | TemplateResult | Renders the policies page.                                                  |
| setupCurrentProjectFromRoute  | newProjectId: number, clearAll: boolean         | void        | Sets up the current project based on the route.                             |
| parseAllActiveIndexes         | params: any                                     | void        | Parses all active indexes from the route parameters.                        |
| renderCrtPage                 | treeId: string \| undefined                     | TemplateResult | Renders the CRT (Critical Race Theory) page.                                |
| renderWebResearchPage         |                                                 | TemplateResult | Renders the web research page.                                              |
| getServerUrlFromClusterId     | clusterId: number                               | string      | Gets the server URL based on the cluster ID.                                |
| openTempPassword              |                                                 | void        | Opens the temporary password dialog.                                        |
| boot                          |                                                 | Promise<void> | Initializes the application boot process.                                   |
| themeChanged                  | target: HTMLElement \| undefined                | void        | Applies the theme changes.                                                  |
| snackbarclosed                |                                                 | void        | Handles the closing of the snackbar.                                        |
| tabChanged                    | event: CustomEvent                              | void        | Handles tab changes.                                                        |
| mobileTabChanged              | event: CustomEvent                              | void        | Handles mobile tab changes.                                                 |
| exitToMainApp                 |                                                 | void        | Exits to the main application.                                              |
| _displaySnackbar              | event: CustomEvent                              | Promise<void> | Displays a snackbar with a message.                                        |
| _setupEventListeners          |                                                 | void        | Sets up event listeners for the application.                                |
| _removeEventListeners         |                                                 | void        | Removes event listeners from the application.                               |
| updateActiveSolutionIndexes   | event: CustomEvent                              | Promise<void> | Updates the active solution indexes based on an event.                      |
| updateActivePolicyIndexes     | event: CustomEvent                              | Promise<void> | Updates the active policy indexes based on an event.                        |
| updatePoliciesRouter          |                                                 | Promise<void> | Updates the router for policies.                                            |
| updateSolutionsRouter         |                                                 | Promise<void> | Updates the router for solutions.                                           |
| updated                       | changedProperties: Map<string \| number \| symbol, unknown> | void | Handles updates to properties.                                              |
| _appError                     | event: CustomEvent                              | void        | Handles application errors.                                                 |
| adminConfirmed                |                                                 | boolean     | Checks if the admin is confirmed.                                           |
| _settingsColorChanged         | event: CustomEvent                              | void        | Handles settings color changes.                                             |
| changeTabTo                   | tabId: number                                   | void        | Changes the active tab to the specified tab ID.                             |
| updateThemeColor              | event: CustomEvent                              | void        | Updates the theme color based on an event.                                  |
| sendVoteAnalytics             |                                                 | void        | Sends analytics data for votes.                                             |
| renderIntroduction            |                                                 | TemplateResult | Renders the introduction section.                                           |
| renderShare                   |                                                 | TemplateResult | Renders the share section.                                                  |
| toggleDarkMode                |                                                 | void        | Toggles the dark mode theme.                                                |
| toggleHighContrastMode        |                                                 | void        | Toggles the high contrast mode theme.                                       |
| setupTheme                    |                                                 | void        | Sets up the theme based on saved settings.                                  |
| startVoting                   |                                                 | void        | Starts the voting process.                                                  |
| openResults                   |                                                 | void        | Opens the results page.                                                     |
| openAnalytics                 |                                                 | void        | Opens the analytics page.                                                   |
| goToAdmin                     |                                                 | void        | Navigates to the admin page.                                                |
| openGitHub                    |                                                 | void        | Opens the GitHub page in a new tab.                                         |
| renderStats                   |                                                 | TemplateResult | Renders the statistics section.                                             |
| renderCosts                   |                                                 | TemplateResult | Renders the costs section.                                                  |
| renderContentOrLoader         | content: TemplateResult                         | TemplateResult | Renders content or a loader based on the current state.                     |
| handleShowMore                | event: CustomEvent                              | void        | Handles the "show more" action for displaying additional information.       |
| getCustomVersion              | version: string                                 | string      | Gets a custom version string based on the current date.                     |
| renderThemeToggle             | hideText: boolean                               | TemplateResult | Renders the theme toggle buttons.                                           |
| renderLogo                    |                                                 | TemplateResult | Renders the application logo.                                               |
| openSolutions                 |                                                 | Promise<void> | Opens the solutions page and resets the state.                              |
| openPolicies                  |                                                 | Promise<void> | Opens the policies page and resets the state.                               |
| openWebResearch               |                                                 | void        | Opens the web research page.                                                |
| renderNavigationBar           |                                                 | TemplateResult | Renders the navigation bar based on the current state.                      |
| submitTempPassword            |                                                 | void        | Submits the temporary password and continues the boot process.              |
| renderTempLoginDialog         |                                                 | TemplateResult | Renders the temporary login dialog.                                         |
| render                        |                                                 | TemplateResult | Renders the main application content.                                       |

## Example

```typescript
import '@policysynth/webapp/ps-app.js';

// Example usage of PolicySynthWebApp
const app = document.createElement('ps-app');
document.body.appendChild(app);

// Example of setting properties
app.currentProjectId = 123;
app.themeColor = '#3f5fce';

// Example of calling methods
app.setupTheme();
app.toggleDarkMode();
```

This example demonstrates how to import and use the `PolicySynthWebApp` class in a web application. It shows how to create an instance of the class, set properties, and call methods to interact with the application.