# PsRawEvidence

This class extends `YpBaseElement` to manage and display raw evidence related to policies. It handles the loading, organizing, and rendering of raw evidence data, including displaying a dropdown for quick navigation between different types of evidence.

## Properties

| Name                   | Type                                                         | Description                                                                 |
|------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------|
| memory                 | IEngineInnovationMemoryData                                  | The memory data related to the engine innovation.                           |
| policy                 | PSPolicy                                                     | The policy data.                                                            |
| activeSubProblemIndex  | number                                                       | The index of the currently active sub-problem.                             |
| activeRawEvidence      | PSEvidenceRawWebPageData[]                                   | The currently active raw evidence data.                                     |
| groupedRawEvidence     | Record<string, PSEvidenceRawWebPageData[]>                   | The raw evidence data grouped by type.                                      |
| loading                | boolean                                                      | Indicates if the raw evidence data is currently being loaded.               |
| showDropdown           | boolean                                                      | Controls the visibility of the evidence type dropdown.                      |
| showFullList           | Record<string, boolean>                                      | Tracks which lists of evidence have been expanded to show their full content.|

## Methods

| Name                  | Parameters                                  | Return Type | Description                                                                                   |
|-----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll          |                                             | void        | Handles the scroll event to toggle the visibility of the evidence type dropdown.              |
| connectedCallback     |                                             | Promise<void> | Performs setup tasks when the component is added to the document.                            |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Handles updates to component properties.                                                      |
| setupRawEvidence      |                                             | void        | Organizes the raw evidence data into groups and sorts them.                                   |
| disconnectedCallback  |                                             | void        | Cleans up when the component is removed from the document.                                    |
| formatSearchType      | searchType: string                          | string      | Formats the search type string for display.                                                   |
| loadRawEvidence       |                                             | Promise<void> | Loads the raw evidence data from the server.                                                  |
| renderHeader          | evidence: PSEvidenceRawWebPageData          | TemplateResult | Renders the header for a piece of evidence.                                                   |
| scrollToEvidenceType  | evidenceType: string                        | void        | Scrolls to the specified evidence type section.                                               |
| renderDropdown        |                                             | TemplateResult | Renders the dropdown for quick navigation between evidence types.                             |
| renderPieceOfEvidence | evidence: PSEvidenceRawWebPageData          | TemplateResult | Renders a single piece of evidence.                                                           |
| camelCaseToRegular    | text: string                                | string      | Converts a camelCase string to regular spacing and capitalizes the first letter.              |
| renderShortList       | url: string, title: string, list: string[]  | TemplateResult \| typeof nothing | Renders a short list of items, with an option to expand to show more.                         |
| toggleShowFullList    | key: string                                 | void        | Toggles the visibility of the full list for a given key.                                      |
| renderActiveRawEvidence |                                             | TemplateResult | Renders the active raw evidence, including the dropdown and evidence sections.                |
| render                |                                             | TemplateResult \| typeof nothing | Renders the component based on its state (loading, active evidence, or nothing).              |

## Events

No custom events are documented.

## Example

```typescript
import { PsRawEvidence } from '@policysynth/webapp/policies/ps-raw-evidence.js';

// Example usage in a LitElement template
html`<ps-raw-evidence .memory=${this.memory} .policy=${this.policy}></ps-raw-evidence>`;
```

This example demonstrates how to use the `PsRawEvidence` component within a LitElement template, passing in the necessary `memory` and `policy` properties.