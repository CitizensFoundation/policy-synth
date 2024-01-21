# CpsApp

The `CpsApp` class is a web component that serves as the main application for a policy synthesis platform. It is responsible for managing the user interface, routing, and state of the application.

## Properties

| Name                      | Type                                  | Description                                                                 |
|---------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| currentProjectId          | number \| undefined                   | The ID of the current project being viewed or edited.                        |
| activeSubProblemIndex     | number \| undefined                   | The index of the active sub-problem within the current project.             |
| activePopulationIndex     | number \| undefined                   | The index of the active population within the current sub-problem.          |
| activeSolutionIndex       | number \| undefined                   | The index of the active solution within the current population.             |
| activePolicyIndex         | number \| undefined                   | The index of the active policy within the current population.               |
| pageIndex                 | number                                | The index of the current page being displayed.                              |
| currentMemory             | IEngineInnovationMemoryData \| undefined | The current memory state of the engine's innovation data.                   |
| totalNumberOfVotes        | number                                | The total number of votes cast within the application.                      |
| showAllCosts              | boolean                               | A flag indicating whether to show all costs associated with the application.|
| lastSnackbarText          | string \| undefined                   | The text of the last snackbar notification displayed.                       |
| collectionType            | string                                | The type of collection being managed (e.g., 'domain').                      |
| earlName                  | string                                | The name of the EARL (a reference to a specific entity within the app).     |
| currentError              | string \| undefined                   | The current error message, if any.                                          |
| forceGetBackupForProject  | string \| undefined                   | A string used to force the retrieval of a backup for the project.           |
| tempPassword              | string \| undefined                   | A temporary password used for authentication purposes.                      |
| themeColor                | string                                | The primary color of the application's theme.                               |
| themePrimaryColor         | string                                | The primary color used in the application's theme.                          |
| themeSecondaryColor       | string                                | The secondary color used in the application's theme.                        |
| themeTertiaryColor        | string                                | The tertiary color used in the application's theme.                         |
| themeNeutralColor         | string                                | The neutral color used in the application's theme.                          |
| themeScheme               | Scheme                                | The color scheme used in the application's theme.                           |
| themeHighContrast         | boolean                               | A flag indicating whether the theme is in high contrast mode.               |
| isAdmin                   | boolean                               | A flag indicating whether the current user has administrative privileges.   |
| surveyClosed              | boolean                               | A flag indicating whether the survey is closed.                             |
| appearanceLookup          | string                                | A string used for appearance lookup.                                        |
| currentLeftAnswer         | string                                | The current left answer in a survey or poll.                                |
| currentRightAnswer        | string                                | The current right answer in a survey or poll.                               |
| numberOfSolutionsGenerations | number                            | The number of generations of solutions created.                             |
| numberOfPoliciesIdeasGeneration | number                         | The number of generations of policy ideas created.                          |
| totalSolutions            | number                                | The total number of solutions generated.                                    |
| totalPros                 | number                                | The total number of pros associated with solutions.                         |
| totalCons                 | number                                | The total number of cons associated with solutions.                         |
| drawer                    | MdNavigationDrawer                    | A reference to the navigation drawer component.                             |

## Methods

| Name                           | Parameters        | Return Type | Description                                                                 |
|--------------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| renderSolutionPage             |                   | TemplateResult | Renders the solutions page.                                                 |
| renderPoliciesPage             |                   | TemplateResult | Renders the policies page.                                                  |
| setupCurrentProjectFromRoute   | newProjectId: number, clearAll: boolean | void | Sets up the current project based on the route.                             |
| parseAllActiveIndexes          | params: any       | void        | Parses all active indexes from the route parameters.                        |
| renderCrtPage                  | treeId: string \| undefined | TemplateResult | Renders the CRT (Critical Response Team) management page.                   |
| renderWebResearchPage          |                   | TemplateResult | Renders the web research page.                                              |
| getServerUrlFromClusterId      | clusterId: number | string      | Returns the server URL based on the cluster ID.                             |
| connectedCallback              |                   | void        | Lifecycle method called when the component is added to the document's DOM.  |
| openTempPassword               |                   | void        | Opens the temporary password dialog.                                        |
| boot                           |                   | Promise<void> | Initializes the application by fetching project data.                       |
| disconnectedCallback           |                   | void        | Lifecycle method called when the component is removed from the document's DOM. |
| getHexColor                    | color: string     | string \| undefined | Returns the hex color string.                                              |
| themeChanged                   | target: HTMLElement \| undefined | void | Applies the theme changes.                                                  |
| snackbarclosed                 |                   | void        | Handles the closing of the snackbar.                                        |
| tabChanged                     | event: CustomEvent | void        | Handles the change of tabs.                                                  |
| mobileTabChanged               | event: CustomEvent | void        | Handles the change of tabs on mobile devices.                                |
| exitToMainApp                  |                   | void        | Exits to the main application.                                               |
| _displaySnackbar               | event: CustomEvent | void        | Displays a snackbar with a message.                                          |
| _setupEventListeners           |                   | void        | Sets up event listeners for the component.                                   |
| _removeEventListeners          |                   | void        | Removes event listeners from the component.                                  |
| externalGoalTrigger            |                   | void        | Triggers an external goal based on a URL.                                    |
| updateActiveSolutionIndexes    | event: CustomEvent | void        | Updates the active solution indexes based on an event.                       |
| updateActivePolicyIndexes      | event: CustomEvent | void        | Updates the active policy indexes based on an event.                         |
| updatePoliciesRouter           |                   | Promise<void> | Updates the router for the policies page.                                    |
| updateSolutionsRouter          |                   | Promise<void> | Updates the router for the solutions page.                                   |
| updated                        | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the component's properties have changed.      |
| _appError                      | event: CustomEvent | void        | Handles application errors.                                                  |
| adminConfirmed                 |                   | boolean     | Returns true if the admin is confirmed.                                      |
| _settingsColorChanged          | event: CustomEvent | void        | Handles changes to the settings color.                                       |
| styles                         |                   | CSSResult[] | Returns the styles for the component.                                        |
| changeTabTo                    | tabId: number     | void        | Changes the active tab to the specified tab ID.                              |
| updateThemeColor               | event: CustomEvent | void        | Updates the theme color based on an event.                                   |
| sendVoteAnalytics              |                   | void        | Sends analytics data for votes.                                              |
| renderIntroduction             |                   | TemplateResult | Renders the introduction section.                                           |
| renderShare                    |                   | TemplateResult | Renders the share section.                                                  |
| toggleDarkMode                 |                   | void        | Toggles the dark mode theme.                                                 |
| toggleHighContrastMode         |                   | void        | Toggles the high contrast mode theme.                                        |
| setupTheme                     |                   | void        | Sets up the theme based on saved settings.                                   |
| startVoting                    |                   | void        | Starts the voting process.                                                   |
| openResults                    |                   | void        | Opens the results page.                                                      |
| openAnalytics                  |                   | void        | Opens the analytics page.                                                    |
| goToAdmin                      |                   | void        | Navigates to the admin page.                                                 |
| openGitHub                     |                   | void        | Opens the GitHub page in a new tab.                                          |
| renderStats                    |                   | TemplateResult | Renders the statistics section.                                             |
| renderCosts                    |                   | TemplateResult | Renders the costs section.                                                  |
| renderContentOrLoader          | content: TemplateResult | TemplateResult | Renders the content or a loader if the content is not ready.                |
| handleShowMore                 | event: CustomEvent | void        | Handles the "show more" action for displaying additional costs.              |
| getCustomVersion               | version: string   | string      | Returns a custom version string with the build date.                         |
| renderThemeToggle              |                   | TemplateResult | Renders the theme toggle controls.                                          |
| renderLogo                     |                   | TemplateResult | Renders the application logo.                                               |
| openSolutions                  |                   | Promise<void> | Opens the solutions page and resets the state.                              |
| openPolicies                   |                   | Promise<void> | Opens the policies page and resets the state.                               |
| openWebResearch                |                   | void        | Opens the web research page.                                                 |
| renderNavigationBar            |                   | TemplateResult | Renders the navigation bar.                                                 |
| submitTempPassword             |                   | void        | Submits the temporary password.                                              |
| renderTempLoginDialog          |                   | TemplateResult | Renders the temporary login dialog.                                         |
| render                         |                   | TemplateResult | Renders the component.                                                      |

## Events (if any)

- **app-error**: Emitted when an application error occurs.
- **display-snackbar**: Emitted when a snackbar message needs to be displayed.
- **toggle-dark-mode**: Emitted when the dark mode theme is toggled.
- **toggle-high-contrast-mode**: Emitted when the high contrast mode theme is toggled.
- **yp-external-goal-trigger**: Emitted when an external goal is triggered.
- **update-route**: Emitted when the active solution or policy indexes are updated.

## Examples

```typescript
// Example usage of the CpsApp component
<cps-app></cps-app>
```

Note: The actual usage of the component would depend on the context of the application and the specific functionalities being utilized.