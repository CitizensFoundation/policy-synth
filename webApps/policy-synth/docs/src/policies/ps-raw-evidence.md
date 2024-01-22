# PsRawEvidence

The `PsRawEvidence` class is a web component that displays raw evidence related to a policy within a problem-solving application. It extends from `YpBaseElement` and uses various Material Web Components and custom elements to render the UI.

## Properties

| Name                    | Type                                                         | Description                                                                                   |
|-------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| memory                  | IEngineInnovationMemoryData                                  | The memory data associated with the engine innovation.                                        |
| policy                  | PSPolicy                                                     | The policy data for which the raw evidence is being displayed.                                |
| activeSubProblemIndex   | number                                                       | The index of the currently active sub-problem.                                                |
| activeRawEvidence       | PSEvidenceRawWebPageData[]                                   | An array of raw evidence data related to the active sub-problem and policy.                   |
| groupedRawEvidence      | Record<string, PSEvidenceRawWebPageData[]>                   | A record grouping raw evidence by their search type.                                          |
| loading                 | boolean                                                      | Indicates whether the component is currently loading data.                                    |
| showDropdown            | boolean                                                      | Controls the visibility of the dropdown menu for navigating evidence types.                   |
| showFullList            | Record<string, boolean>                                      | A record tracking which lists should be fully displayed based on their unique identifier key. |

## Methods

| Name                  | Parameters                        | Return Type | Description                                                                                   |
|-----------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| handleScroll          |                                   | void        | Handles the scroll event to toggle the visibility of the dropdown menu.                       |
| connectedCallback     |                                   | Promise<void> | Lifecycle method that runs when the component is added to the DOM.                            |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method that runs when the component's properties have changed.                      |
| setupRawEvidence      |                                   | void        | Organizes the raw evidence data into groups and sorts them.                                   |
| disconnectedCallback  |                                   | void        | Lifecycle method that runs when the component is removed from the DOM.                        |
| formatSearchType      | searchType: string                | string      | Formats the search type string to be more human-readable.                                     |
| loadRawEvidence       |                                   | Promise<void> | Loads the raw evidence data from the server API.                                              |
| renderHeader          | evidence: PSEvidenceRawWebPageData | TemplateResult | Renders the header section for a piece of evidence.                                           |
| scrollToEvidenceType  | evidenceType: string              | void        | Scrolls the view to the specified evidence type section.                                      |
| renderDropdown        |                                   | TemplateResult | Renders the dropdown menu for navigating evidence types.                                      |
| renderPieceOfEvidence | evidence: PSEvidenceRawWebPageData | TemplateResult | Renders a single piece of evidence.                                                           |
| camelCaseToRegular    | text: string                      | string      | Converts a camelCase string to a regular spaced string with the first letter capitalized.     |
| renderShortList       | url: string, title: string, list: string[] | TemplateResult | Renders a short list of items with a title, and provides a toggle for showing more items.     |
| toggleShowFullList    | key: string                       | void        | Toggles the visibility of the full list for a given key.                                      |
| renderActiveRawEvidence |                                   | TemplateResult | Renders the active raw evidence grouped by search type.                                       |
| render                |                                   | TemplateResult | Renders the component based on the current state (loading, active evidence, or nothing).      |

## Events (if any)

- **scroll**: The `handleScroll` method is bound to the window scroll event to manage the visibility of the dropdown menu.

## Examples

```typescript
// Example usage of the PsRawEvidence web component
<ps-raw-evidence
  .memory=${this.memoryData}
  .policy=${this.policyData}
  .activeSubProblemIndex=${this.currentSubProblemIndex}
></ps-raw-evidence>
```

Note: The `PsRawEvidence` class also includes a static property `rawPolicyCache` which is a record used to cache raw evidence data for policies.