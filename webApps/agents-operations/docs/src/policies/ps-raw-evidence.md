# PsRawEvidence

This class represents the raw evidence component in the application. It extends `YpBaseElement` to leverage common functionalities and properties. The component is responsible for displaying raw evidence related to policies, including handling the loading of evidence, grouping evidence by type, and providing interactive elements to navigate through the evidence.

## Properties

| Name                    | Type                                                         | Description                                                                 |
|-------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------|
| memory                  | `PsSmarterCrowdsourcingMemoryData`                                           | The memory data associated with the evidence.                               |
| policy                  | `PSPolicy`                                                   | The policy data associated with the evidence.                               |
| activeSubProblemIndex   | `number`                                                     | The index of the active sub-problem.                                        |
| activeRawEvidence       | `PSEvidenceRawWebPageData[]`                                 | The list of active raw evidence web page data.                              |
| groupedRawEvidence      | `Record<string, PSEvidenceRawWebPageData[]>`                 | The raw evidence data grouped by search type.                               |
| loading                 | `boolean`                                                    | Indicates whether the component is in a loading state.                      |
| showDropdown            | `boolean`                                                    | Controls the visibility of the dropdown for navigating evidence types.      |
| showFullList            | `Record<string, boolean>`                                    | Tracks which lists of evidence have been expanded to show their full content. |

## Methods

| Name                  | Parameters                          | Return Type | Description                                                                                   |
|-----------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll          |                                     | `void`      | Handles scroll events to toggle the visibility of the evidence type navigation dropdown.     |
| connectedCallback     |                                     | `void`      | Lifecycle method called when the component is added to the document's DOM.                   |
| updated               | `changedProperties: Map<string \| number \| symbol, unknown>` | `void`      | Lifecycle method called after the component’s properties have been updated.                  |
| setupRawEvidence      |                                     | `void`      | Organizes the raw evidence data into groups and sorts them.                                  |
| disconnectedCallback  |                                     | `void`      | Lifecycle method called when the component is removed from the document's DOM.               |
| formatSearchType      | `searchType: string`                | `string`    | Formats the search type string by inserting spaces before capital letters and capitalizing the first letter. |
| loadRawEvidence       |                                     | `Promise<void>` | Loads the raw evidence data from the server.                                                |
| renderHeader          | `evidence: PSEvidenceRawWebPageData`| `TemplateResult` | Renders the header section for a piece of evidence.                                         |
| scrollToEvidenceType  | `evidenceType: string`              | `void`      | Scrolls the view to the specified evidence type section.                                     |
| renderDropdown        |                                     | `TemplateResult` | Renders the dropdown for navigating evidence types.                                          |
| renderPieceOfEvidence | `evidence: PSEvidenceRawWebPageData`| `TemplateResult` | Renders a single piece of evidence.                                                         |
| camelCaseToRegular    | `text: string`                      | `string`    | Converts camel case text to regular text with spaces.                                        |
| renderShortList       | `url: string, title: string, list: string[]` | `TemplateResult` | Renders a short list of items with an option to expand.                                     |
| toggleShowFullList    | `key: string`                       | `void`      | Toggles the visibility of the full list for a given key.                                     |
| renderActiveRawEvidence|                                    | `TemplateResult` | Renders the active raw evidence grouped by type.                                            |
| render                |                                     | `TemplateResult` | Renders the component based on its state (loading, active evidence, or nothing).            |

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

This example demonstrates how to use the `ps-raw-evidence` component within a LitElement template. The component requires `memory`, `policy`, and `activeSubProblemIndex` properties to be set for it to function correctly.