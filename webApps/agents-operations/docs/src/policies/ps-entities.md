# PsEntities

`PsEntities` is a custom element that extends `PsStageBase` to manage and display entities related to sub-problems within a problem-solving stage. It handles the rendering of sub-problems and their associated entities, including their positive and negative effects, and provides navigation between different entities and sub-problems.

## Properties

| Name               | Type                | Description                                                                 |
|--------------------|---------------------|-----------------------------------------------------------------------------|
| activeEntityIndex  | number \| null      | The index of the currently active entity. `null` if no entity is selected.  |
| maxNumberOfTopEntities | number            | The maximum number of top entities to display prominently.                  |

## Methods

| Name                 | Parameters                                    | Return Type | Description                                                                                   |
|----------------------|-----------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| connectedCallback    |                                               | void        | Invoked when the element is added to the document's DOM. Sets the maximum number of top entities based on the group ID. |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void        | Invoked after the element’s properties have changed. Calls the `super.updated` method.        |
| disconnectedCallback |                                               | void        | Invoked when the element is removed from the document's DOM. Logs activity closure.           |
| render               |                                               | TemplateResult | Renders the element based on the current state, displaying either the entity screen, sub-problem screen, or sub-problem list. |
| renderSubProblemScreen | subProblem: PsSubProblem               | TemplateResult | Renders the screen for a specific sub-problem, including its entities and their effects.       |
| renderEntityScreen   | entity: PsAffectedEntity                | TemplateResult | Renders the screen for a specific entity, displaying the problem statement and sub-problems.   |

## Events

None specified.

## Example

```typescript
import '@policysynth/webapp/policies/ps-entities.js';

// Usage within a LitElement
render() {
  return html`
    <ps-entities .memory=${this.problemMemory}></ps-entities>
  `;
}
```

This example demonstrates how to use the `ps-entities` custom element within another LitElement component. It passes the problem memory object to the `ps-entities` element, which then handles the rendering of sub-problems and entities based on the provided memory.