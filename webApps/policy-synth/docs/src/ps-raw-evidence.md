# PsRawEvidence

The `PsRawEvidence` class is a web component that displays raw evidence related to policies. It groups and sorts evidence by type and allows users to navigate through different evidence types using a dropdown menu. The component also handles user interactions such as scrolling and toggling the full list of evidence items.

## Properties

| Name                    | Type                                                         | Description                                                                                   |
|-------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| memory                  | IEngineInnovationMemoryData                                  | The memory data associated with the engine innovation.                                        |
| policy                  | PSPolicy                                                     | The policy data that is currently active.                                                     |
| activeSubProblemIndex   | number                                                       | The index of the currently active sub-problem.                                                |
| activeRawEvidence       | PSEvidenceRawWebPageData[]                                   | The list of active raw evidence related to the web page.                                      |
| groupedRawEvidence      | Record<string, PSEvidenceRawWebPageData[]>                   | The raw evidence grouped by search type.                                                      |
| loading                 | boolean                                                      | Indicates whether the component is currently loading data.                                    |
| showDropdown            | boolean                                                      | Determines whether the dropdown menu should be shown based on scroll position.                |
| showFullList            | Record<string, boolean>                                      | Tracks which lists of evidence have been expanded to show their full contents.                |

## Methods

| Name                   | Parameters                        | Return Type | Description                                                                                   |
|------------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll           |                                   | void        | Handles the scroll event to toggle the visibility of the dropdown menu.                       |
| connectedCallback      |                                   | Promise<void> | Lifecycle method that runs when the component is inserted into the DOM.                      |
| updated                | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties have changed.                     |
| setupRawEvidence       |                                   | void        | Organizes the raw evidence into groups and sorts them.                                        |
| disconnectedCallback   |                                   | void        | Lifecycle method that runs when the component is removed from the DOM.                        |
| formatSearchType       | searchType: string                | string      | Formats the search type string to be more human-readable.                                     |
| loadRawEvidence        |                                   | Promise<void> | Loads the raw evidence data from the server API.                                             |
| renderHeader           | evidence: PSEvidenceRawWebPageData | TemplateResult | Renders the header section for a piece of evidence.                                          |
| scrollToEvidenceType   | evidenceType: string              | void        | Scrolls the view to the specified evidence type section.                                      |
| renderDropdown         |                                   | TemplateResult | Renders the dropdown menu for navigating evidence types.                                     |
| renderPieceOfEvidence  | evidence: PSEvidenceRawWebPageData | TemplateResult | Renders a single piece of evidence.                                                          |
| camelCaseToRegular     | text: string                      | string      | Converts a camelCase string to a regular spaced string with the first letter capitalized.     |
| renderShortList        | url: string, title: string, list: string[] | TemplateResult | Renders a short list of evidence items with a title.                                        |
| toggleShowFullList     | key: string                       | void        | Toggles the visibility of the full list for a given evidence item.                            |
| renderActiveRawEvidence |                                   | TemplateResult | Renders the active raw evidence grouped by type.                                             |
| render                 |                                   | TemplateResult | Renders the component based on the current state (loading, active evidence, or nothing).     |

## Events

- **scroll**: Emitted when the user scrolls the page. Used to determine the visibility of the dropdown menu.

## Examples

```typescript
// Example usage of the PsRawEvidence web component
<ps-raw-evidence .memory=${memoryData} .policy=${policyData}></ps-raw-evidence>
```

Note: The `PsRawEvidence` class also includes a static property `rawPolicyCache` which is a record used to cache raw policy evidence data.