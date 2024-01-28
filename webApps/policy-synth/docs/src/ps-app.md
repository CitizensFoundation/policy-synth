# PolicySynthWebApp

This class represents the main web application for Policy Synth. It extends `YpBaseElement` to provide a comprehensive web interface for managing and interacting with policy synthesis processes. The application includes features such as project management, solution exploration, policy idea generation, and web research automation.

## Properties

| Name                        | Type                                  | Description                                                                 |
|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| currentProjectId            | number \| undefined                   | The ID of the current project being viewed or managed.                      |
| activeSubProblemIndex       | number \| undefined                   | The index of the active sub-problem within the current project.             |
| activePopulationIndex       | number \| undefined                   | The index of the active population within the current sub-problem.          |
| activeSolutionIndex         | number \| undefined                   | The index of the active solution within the current population.             |
| activePolicyIndex           | number \| undefined                   | The index of the active policy within the current project.                  |
| pageIndex                   | number                                | The index of the current page being viewed.                                 |
| currentMemory               | PsBaseMemoryData \| undefined         | The current memory state of the project, containing all relevant data.      |
| totalNumberOfVotes          | number                                | The total number of votes cast in the current session.                      |
| showAllCosts                | boolean                               | Flag to show all costs associated with the project.                         |
| lastSnackbarText            | string \| undefined                   | The text to be displayed in the last snackbar message.                      |
| collectionType              | string                                | The type of collection being managed (e.g., 'domain').                      |
| earlName                    | string                                | The name of the EARL (Entity, Attribute, Relationship, Location) model.     |
| currentError                | string \| undefined                   | The current error message, if any.                                          |
| forceGetBackupForProject    | string \| undefined                   | Forces the retrieval of a backup for the project, if specified.            |
| tempPassword                | string \| undefined                   | Temporary password for accessing restricted features.                       |
| localStorageThemeColorKey   | string                                | The local storage key for storing the theme color.                          |
| themeColor                  | string                                | The primary theme color.                                                    |
| themePrimaryColor           | string                                | The primary color used in the theme.                                        |
| themeSecondaryColor         | string                                | The secondary color used in the theme.                                      |
| themeTertiaryColor          | string                                | The tertiary color used in the theme.                                       |
| themeNeutralColor           | string                                | The neutral color used in the theme.                                        |
| themeScheme                 | Scheme                                | The color scheme used in the theme.                                         |
| themeHighContrast           | boolean                               | Flag to indicate if high contrast mode is enabled.                          |
| isAdmin                     | boolean                               | Flag to indicate if the current user is an admin.                           |
| surveyClosed                | boolean                               | Flag to indicate if the survey is closed.                                   |
| appearanceLookup            | string                                | A string used for looking up appearance settings.                           |
| currentLeftAnswer           | string                                | The current left answer option in a survey or poll.                         |
| currentRightAnswer          | string                                | The current right answer option in a survey or poll.                        |
| numberOfSolutionsGenerations| number                                | The number of generations of solutions created.                             |
| numberOfPoliciesIdeasGeneration| number                             | The number of generations of policy ideas created.                          |
| totalSolutions              | number                                | The total number of solutions generated.                                    |
| totalPros                   | number                                | The total number of pros associated with solutions.                         |
| totalCons                   | number                                | The total number of cons associated with solutions.                         |
| drawer                      | MdNavigationDrawer                    | The navigation drawer component.                                            |
| router                      | PsRouter                              | The router component for managing application routing.                      |

## Methods

| Name                          | Parameters                          | Return Type | Description                                                                 |
|-------------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderSolutionPage            |                                     | TemplateResult | Renders the solution page with navigation and content.                      |
| renderPoliciesPage            |                                     | TemplateResult | Renders the policies page with navigation and content.                      |
| setupCurrentProjectFromRoute  | newProjectId: number, clearAll: boolean | void        | Sets up the current project based on the route, optionally clearing indexes.|
| parseAllActiveIndexes         | params: any                         | void        | Parses and sets all active indexes from URL parameters.                     |
| renderCrtPage                 | treeId: string \| undefined         | TemplateResult | Renders the CRT (Causal Relationship Tree) management page.                 |
| renderWebResearchPage         |                                     | TemplateResult | Renders the web research page with navigation and content.                  |
| getServerUrlFromClusterId     | clusterId: number                   | string      | Returns the server URL based on the cluster ID.                             |
| openTempPassword              |                                     | void        | Opens the temporary password dialog.                                        |
| boot                          |                                     | Promise<void> | Initializes the application, fetching project data and setting up the theme.|
| themeChanged                  | target: HTMLElement \| undefined    | void        | Applies the theme changes to the application.                               |
| snackbarclosed                |                                     | void        | Handles the closing of the snackbar.                                        |
| tabChanged                    | event: CustomEvent                  | void        | Handles tab changes in the navigation bar.                                  |
| mobileTabChanged              | event: CustomEvent                  | void        | Handles tab changes in the mobile navigation bar.                           |
| exitToMainApp                 |                                     | void        | Exits to the main application page.                                         |
| _displaySnackbar              | event: CustomEvent                  | Promise<void> | Displays a snackbar with a message.                                         |
| _setupEventListeners          |                                     | void        | Sets up event listeners for the application.                                |
| _removeEventListeners         |                                     | void        | Removes event listeners from the application.                               |
| updateActiveSolutionIndexes   | event: CustomEvent                  | Promise<void> | Updates active solution indexes and updates the router.                     |
| updateActivePolicyIndexes     | event: CustomEvent                  | Promise<void> | Updates active policy indexes and updates the router.                       |
| updatePoliciesRouter          |                                     | Promise<void> | Updates the router based on active policy indexes.                          |
| updateSolutionsRouter         |                                     | Promise<void> | Updates the router based on active solution indexes.                        |
| updated                       | changedProperties: Map<string \| number \| symbol, unknown> | void | Handles updates to properties.                                              |
| _appError                     | event: CustomEvent                  | void        | Handles application errors.                                                 |
| adminConfirmed                |                                     | boolean     | Returns true if the admin is confirmed.                                     |
| _settingsColorChanged         | event: CustomEvent                  | void        | Handles theme color changes from settings.                                  |
| changeTabTo                   | tabId: number                       | void        | Changes the active tab to the specified tab ID.                             |
| updateThemeColor              | event: CustomEvent                  | void        | Updates the theme color based on an event.                                  |
| sendVoteAnalytics             |                                     | void        | Sends analytics data for votes.                                             |
| renderIntroduction            |                                     | TemplateResult | Renders the introduction content.                                           |
| renderShare                   |                                     | TemplateResult | Renders the share content.                                                  |
| toggleDarkMode                |                                     | void        | Toggles the dark mode theme setting.                                        |
| toggleHighContrastMode        |                                     | void        | Toggles the high contrast mode theme setting.                               |
| setupTheme                    |                                     | void        | Sets up the theme based on saved settings.                                  |
| startVoting                   |                                     | void        | Starts the voting process, changing the page index.                         |
| openResults                   |                                     | void        | Opens the results page, changing the page index.                            |
| openAnalytics                 |                                     | void        | Opens the analytics page.                                                   |
| goToAdmin                     |                                     | void        | Navigates to the admin page.                                                |
| openGitHub                    |                                     | void        | Opens the GitHub page in a new tab.                                         |
| renderStats                   |                                     | TemplateResult | Renders the statistics content.                                             |
| renderCosts                   |                                     | TemplateResult | Renders the costs content.                                                  |
| renderContentOrLoader         | content: TemplateResult             | TemplateResult | Renders the specified content or a loading indicator.                       |
| handleShowMore                | event: CustomEvent                  | void        | Handles the "show more" action for displaying additional costs.             |
| getCustomVersion              | version: string                     | string      | Returns a custom version string based on the current date.                  |
| renderThemeToggle             | hideText: boolean                   | TemplateResult | Renders the theme toggle buttons.                                           |
| renderLogo                    |                                     | TemplateResult | Renders the application logo.                                               |
| openSolutions                 |                                     | Promise<void> | Opens the solutions page and resets the solutions component.                |
| openPolicies                  |                                     | Promise<void> | Opens the policies page and resets the policies component.                  |
| openWebResearch               |                                     | Promise<void> | Opens the web research page and updates the router.                         |
| renderNavigationBar           |                                     | TemplateResult | Renders the navigation bar with appropriate links and actions.              |
| submitTempPassword            |                                     | void        | Submits the temporary password and initializes the application.             |
| renderTempLoginDialog         |                                     | TemplateResult | Renders the temporary login dialog.                                         |
| render                        |                                     | TemplateResult | Renders the main application content.                                       |

## Example

```typescript
import '@policysynth/webapp/ps-app.js';

// Example of using PolicySynthWebApp in a Lit element
@customElement('my-custom-element')
export class MyCustomElement extends LitElement {
  render() {
    return html`
      <ps-app></ps-app>
    `;
  }
}
```

This example demonstrates how to include the `PolicySynthWebApp` component within a custom Lit element.