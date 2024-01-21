# CpsApp

The `CpsApp` class is a custom element that serves as the main application component for a policy synthesis platform. It extends `YpBaseElement` and is decorated with `@customElement('cps-app')` to define a web component.

## Properties

| Name                        | Type                                  | Description                                                                                   |
|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------------------------|
| currentProjectId            | number \| undefined                   | The ID of the current project being viewed or edited.                                          |
| activeSubProblemIndex       | number \| undefined                   | The index of the active sub-problem within the current project.                                |
| activePopulationIndex       | number \| undefined                   | The index of the active population within the current sub-problem.                             |
| activeSolutionIndex         | number \| undefined                   | The index of the active solution within the current population.                                |
| activePolicyIndex           | number \| undefined                   | The index of the active policy within the current project.                                     |
| pageIndex                   | number                                | The index of the current page being displayed.                                                 |
| currentMemory               | IEngineInnovationMemoryData \| undefined | The current memory state of the engine, containing data about the project.                     |
| totalNumberOfVotes          | number                                | The total number of votes cast in the application.                                             |
| showAllCosts                | boolean                               | A flag indicating whether to show all costs associated with the project.                       |
| lastSnackbarText            | string \| undefined                   | The text to be displayed in the last snackbar notification.                                    |
| collectionType              | string                                | The type of collection being used in the project.                                              |
| earlName                    | string                                | The name of the EARL (Easy Accessible Richly Linked) data.                                     |
| currentError                | string \| undefined                   | The current error message, if any.                                                             |
| forceGetBackupForProject    | string \| undefined                   | A string to force the retrieval of a backup for the project.                                   |
| tempPassword                | string \| undefined                   | A temporary password used for authentication.                                                  |
| themeColor                  | string                                | The primary color of the theme.                                                                |
| themePrimaryColor           | string                                | The primary color used in the theme.                                                           |
| themeSecondaryColor         | string                                | The secondary color used in the theme.                                                         |
| themeTertiaryColor          | string                                | The tertiary color used in the theme.                                                          |
| themeNeutralColor           | string                                | The neutral color used in the theme.                                                           |
| themeScheme                 | Scheme                                | The color scheme used in the theme.                                                            |
| themeHighContrast           | boolean                               | A flag indicating whether the theme is in high contrast mode.                                  |
| isAdmin                     | boolean                               | A flag indicating whether the current user is an admin.                                        |
| surveyClosed                | boolean                               | A flag indicating whether the survey is closed.                                                |
| appearanceLookup            | string                                | A string used to look up the appearance settings.                                              |
| currentLeftAnswer           | string                                | The current left answer in a survey or questionnaire.                                          |
| currentRightAnswer          | string                                | The current right answer in a survey or questionnaire.                                         |
| numberOfSolutionsGenerations | number                                | The number of generations of solutions created.                                                |
| numberOfPoliciesIdeasGeneration | number                                | The number of generations of policy ideas created.                                             |
| totalSolutions              | number                                | The total number of solutions generated.                                                       |
| totalPros                   | number                                | The total number of pros associated with solutions.                                            |
| totalCons                   | number                                | The total number of cons associated with solutions.                                            |
| drawer                      | MdNavigationDrawer                    | A reference to the navigation drawer element.                                                  |

## Methods

| Name                         | Parameters        | Return Type | Description                                                                 |
|------------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| renderSolutionPage           | None              | TemplateResult | Renders the solution page content.                                          |
| renderPoliciesPage           | None              | TemplateResult | Renders the policies page content.                                          |
| setupCurrentProjectFromRoute | newProjectId: number, clearAll: boolean | None | Sets up the current project based on the route parameters.                  |
| parseAllActiveIndexes        | params: any       | None        | Parses all active indexes from the route parameters.                        |
| renderCrtPage                | treeId: string \| undefined | TemplateResult | Renders the CRT (Causal Relationship Tree) page content.                    |
| renderWebResearchPage        | None              | TemplateResult | Renders the web research page content.                                      |
| getServerUrlFromClusterId    | clusterId: number | string      | Returns the server URL based on the cluster ID.                             |
| connectedCallback            | None              | None        | Lifecycle callback that is called when the element is added to the document.|
| openTempPassword             | None              | None        | Opens the temporary password dialog.                                        |
| boot                         | None              | Promise<void> | Initializes the application by fetching project data.                       |
| disconnectedCallback         | None              | None        | Lifecycle callback that is called when the element is removed from the document.|
| themeChanged                 | target: HTMLElement \| undefined | None | Applies the theme changes.                                                  |
| snackbarclosed               | None              | None        | Handles the closing of the snackbar.                                        |
| tabChanged                   | event: CustomEvent | None        | Handles the change of tabs.                                                 |
| mobileTabChanged             | event: CustomEvent | None        | Handles the change of tabs on mobile devices.                               |
| exitToMainApp                | None              | None        | Exits to the main application.                                              |
| _displaySnackbar             | event: CustomEvent | None        | Displays a snackbar with a message.                                         |
| _setupEventListeners         | None              | None        | Sets up event listeners for the component.                                  |
| _removeEventListeners        | None              | None        | Removes event listeners from the component.                                 |
| externalGoalTrigger          | None              | None        | Triggers an external goal based on a URL.                                   |
| updateActiveSolutionIndexes  | event: CustomEvent | None        | Updates the active solution indexes based on an event.                      |
| updateActivePolicyIndexes    | event: CustomEvent | None        | Updates the active policy indexes based on an event.                        |
| updatePoliciesRouter         | None              | Promise<void> | Updates the router for the policies page.                                   |
| updateSolutionsRouter        | None              | Promise<void> | Updates the router for the solutions page.                                  |
| updated                      | changedProperties: Map<string \| number \| symbol, unknown> | None | Lifecycle callback that is called after the element’s properties have changed.|
| _appError                    | event: CustomEvent | None        | Handles application errors.                                                 |
| adminConfirmed               | None              | boolean     | Returns true if the admin is confirmed.                                     |
| _settingsColorChanged        | event: CustomEvent | None        | Handles changes to the settings color.                                      |
| styles                       | None              | CSSResult[] | Returns the styles for the component.                                       |
| changeTabTo                  | tabId: number     | None        | Changes the active tab to the specified tab ID.                             |
| updateThemeColor             | event: CustomEvent | None        | Updates the theme color based on an event.                                  |
| sendVoteAnalytics            | None              | None        | Sends analytics data for votes.                                             |
| renderIntroduction           | None              | TemplateResult | Renders the introduction content.                                           |
| renderShare                  | None              | TemplateResult | Renders the share content.                                                  |
| toggleDarkMode               | None              | None        | Toggles the dark mode setting.                                              |
| toggleHighContrastMode       | None              | None        | Toggles the high contrast mode setting.                                     |
| setupTheme                   | None              | None        | Sets up the theme based on local storage settings.                          |
| startVoting                  | None              | None        | Starts the voting process.                                                  |
| openResults                  | None              | None        | Opens the results page.                                                     |
| openAnalytics                | None              | None        | Opens the analytics page.                                                   |
| goToAdmin                    | None              | None        | Goes to the admin page.                                                     |
| openGitHub                   | None              | None        | Opens the GitHub page in a new tab.                                         |
| renderStats                  | None              | TemplateResult | Renders the statistics content.                                             |
| renderCosts                  | None              | TemplateResult | Renders the costs content.                                                  |
| renderContentOrLoader        | content: TemplateResult | TemplateResult | Renders the content or a loader if the content is not ready.                |
| handleShowMore               | event: CustomEvent | None        | Handles the "show more" action for costs.                                   |
| getCustomVersion             | version: string   | string      | Returns a custom version string based on the current date.                  |
| renderThemeToggle            | None              | TemplateResult | Renders the theme toggle content.                                           |
| renderLogo                   | None              | TemplateResult | Renders the logo content.                                                   |
| openSolutions                | None              | Promise<void> | Opens the solutions page.                                                   |
| openPolicies                 | None              | Promise<void> | Opens the policies page.                                                    |
| openWebResearch              | None              | Promise<void> | Opens the web research page.                                                |
| renderNavigationBar          | None              | TemplateResult | Renders the navigation bar content.                                         |
| submitTempPassword           | None              | None        | Submits the temporary password.                                             |
| renderTempLoginDialog        | None              | TemplateResult | Renders the temporary login dialog content.                                 |
| render                       | None              | TemplateResult | Renders the component content.                                              |

## Events (if any)

- **app-error**: Emitted when an application error occurs.
- **display-snackbar**: Emitted when a snackbar message needs to be displayed.
- **toggle-dark-mode**: Emitted when the dark mode setting is toggled.
- **toggle-high-contrast-mode**: Emitted when the high contrast mode setting is toggled.
- **yp-external-goal-trigger**: Emitted when an external goal is triggered.

## Examples

```typescript
// Example usage of the CpsApp component
<cps-app></cps-app>
```

Note: The actual implementation of the `CpsApp` class may include additional methods, properties, and events not listed in this documentation. The provided information is based on the code snippet and the standard Markdown API documentation format.