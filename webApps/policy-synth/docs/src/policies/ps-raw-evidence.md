# PsRawEvidence

The `PsRawEvidence` class is a custom web component that extends `YpBaseElement`. It is responsible for displaying raw evidence related to a policy within a problem-solving environment. The component fetches and organizes evidence data, allowing users to view and interact with the evidence collected for a specific policy.

## Properties

| Name                    | Type                                                         | Description                                                                                   |
|-------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| memory                  | IEngineInnovationMemoryData                                  | Holds the memory data related to the engine innovation.                                        |
| policy                  | PSPolicy                                                     | The policy for which the raw evidence is being displayed.                                      |
| activeSubProblemIndex   | number                                                       | The index of the currently active sub-problem.                                                |
| activeRawEvidence       | PSEvidenceRawWebPageData[]                                   | An array of raw evidence data related to the active sub-problem and policy.                   |
| groupedRawEvidence      | Record<string, PSEvidenceRawWebPageData[]>                   | A record that groups raw evidence by their search type.                                       |
| loading                 | boolean                                                      | Indicates whether the component is currently loading data.                                    |
| showDropdown            | boolean                                                      | Controls the visibility of the dropdown menu for navigating evidence types.                   |
| showFullList            | Record<string, boolean>                                      | A record that tracks which lists of evidence have their full content shown.                   |

## Methods

| Name                | Parameters                        | Return Type | Description                                                                                   |
|---------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll        |                                   | void        | Handles the scroll event to toggle the visibility of the dropdown menu.                       |
| connectedCallback   |                                   | Promise<void> | Lifecycle method that runs when the component is added to the DOM.                            |
| updated             | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties change.                            |
| setupRawEvidence    |                                   | void        | Organizes the raw evidence data into groups and sorts them.                                   |
| disconnectedCallback|                                   | void        | Lifecycle method that runs when the component is removed from the DOM.                        |
| formatSearchType    | searchType: string                | string      | Formats the search type string to be more human-readable.                                     |
| loadRawEvidence     |                                   | Promise<void> | Fetches the raw evidence data from the server API.                                            |
| renderHeader        | evidence: PSEvidenceRawWebPageData| TemplateResult | Renders the header section for a piece of evidence.                                           |
| scrollToEvidenceType| evidenceType: string              | void        | Scrolls the view to the specified evidence type section.                                      |
| renderDropdown      |                                   | TemplateResult | Renders the dropdown menu for navigating evidence types.                                      |
| renderPieceOfEvidence| evidence: PSEvidenceRawWebPageData| TemplateResult | Renders a single piece of evidence.                                                           |
| camelCaseToRegular  | text: string                      | string      | Converts a camelCase string to a regular spaced string with the first letter capitalized.     |
| renderShortList     | url: string, title: string, list: string[] | TemplateResult | Renders a short list of items with a title.                                                   |
| toggleShowFullList  | key: string                       | void        | Toggles the visibility of the full list for a given key.                                      |
| renderActiveRawEvidence |                                 | TemplateResult | Renders the active raw evidence data.                                                         |
| render              |                                   | TemplateResult | Renders the component based on the current state.                                             |

## Events

- **scroll**: Emitted when the user scrolls the page. Used to toggle the visibility of the dropdown menu.

## Examples

```typescript
// Example usage of the PsRawEvidence component
<ps-raw-evidence
  .memory=${this.memoryData}
  .policy=${this.selectedPolicy}
  .activeSubProblemIndex=${this.currentSubProblemIndex}
></ps-raw-evidence>
```

Note: The `PSEvidenceRawWebPageData`, `PSPolicy`, and `IEngineInnovationMemoryData` types are assumed to be defined elsewhere in the codebase and are not detailed in this documentation.