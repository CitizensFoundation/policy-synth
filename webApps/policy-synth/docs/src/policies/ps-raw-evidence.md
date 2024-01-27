# PsRawEvidence

This class represents a custom element that displays raw evidence related to policies. It extends `YpBaseElement` to leverage common functionalities provided by the base element. The component is responsible for fetching, displaying, and organizing raw evidence data into a user-friendly format. It supports features like dynamic evidence grouping, evidence type navigation, and loading states.

## Properties

| Name                   | Type                                                         | Description                                                                 |
|------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------|
| memory                 | PsBaseMemoryData                                  | Holds memory data related to engine innovation.                             |
| policy                 | PSPolicy                                                     | The policy object associated with the current evidence.                     |
| activeSubProblemIndex  | number                                                       | Index of the active sub-problem.                                            |
| activeRawEvidence      | PSEvidenceRawWebPageData[]                                   | Array of raw evidence data for the active policy and sub-problem.           |
| groupedRawEvidence     | Record<string, PSEvidenceRawWebPageData[]>                   | Organized raw evidence data grouped by evidence type.                       |
| loading                | boolean                                                      | Indicates whether the component is in a loading state.                      |
| showDropdown           | boolean                                                      | Controls the visibility of the evidence type dropdown menu.                 |
| showFullList           | Record<string, boolean>                                      | Tracks visibility states for full lists of evidence details.                |

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                                   |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll          |                                             | void        | Handles scroll events to toggle the visibility of the evidence type dropdown based on scroll position. |
| connectedCallback     |                                             | Promise<void> | Lifecycle method that runs when the component is added to the DOM. Registers scroll event listener. |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties change. Updates evidence data.    |
| setupRawEvidence      |                                             | void        | Organizes raw evidence data into groups and sorts them.                                       |
| disconnectedCallback  |                                             | void        | Lifecycle method that runs when the component is removed from the DOM. Removes scroll event listener. |
| formatSearchType      | searchType: string                          | string      | Formats evidence search type strings into a more readable format.                             |
| loadRawEvidence       |                                             | Promise<void> | Fetches raw evidence data from the server and updates the component state.                    |
| renderHeader          | evidence: PSEvidenceRawWebPageData          | TemplateResult | Generates HTML for the header section of an evidence item.                                    |
| scrollToEvidenceType  | evidenceType: string                        | void        | Scrolls the view to the specified evidence type section.                                      |
| renderDropdown        |                                             | TemplateResult | Generates HTML for the evidence type dropdown menu.                                           |
| renderPieceOfEvidence | evidence: PSEvidenceRawWebPageData          | TemplateResult | Generates HTML for a single piece of evidence.                                                |
| camelCaseToRegular    | text: string                                | string      | Converts camelCase strings to regular space-separated strings.                                |
| renderShortList       | url: string, title: string, list: string[]  | TemplateResult | Generates HTML for a short list of evidence details.                                          |
| toggleShowFullList    | key: string                                 | void        | Toggles the visibility of the full list for a given evidence detail.                         |
| renderActiveRawEvidence |                                             | TemplateResult | Generates HTML for the active raw evidence, including dropdown and evidence sections.         |
| render                |                                             | TemplateResult | Main render method that generates HTML based on the component's state.                       |

## Events

No custom events are documented.

## Example

```typescript
import '@policysynth/webapp/policies/ps-raw-evidence.js';

// Usage in a LitElement template
html`
  <ps-raw-evidence
    .memory=${this.memoryData}
    .policy=${this.policyData}
    .activeSubProblemIndex=${this.activeIndex}
  ></ps-raw-evidence>
`;
```

This example demonstrates how to use the `ps-raw-evidence` custom element within a LitElement-based component. It involves passing the necessary data properties such as memory data, policy data, and the active sub-problem index to the custom element for it to fetch and display the relevant raw evidence.