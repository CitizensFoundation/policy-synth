# PsEntities

`PsEntities` is a custom element that extends `PsStageBase` to manage and display entities related to sub-problems within a problem-solving stage. It handles the rendering of sub-problems and their associated entities, including their positive and negative effects, and integrates with the global activity logger.

## Properties

| Name               | Type                | Description                                                                 |
|--------------------|---------------------|-----------------------------------------------------------------------------|
| activeEntityIndex  | number \| null      | The index of the currently active entity. Can be null if no entity is active. |
| maxNumberOfTopEntities | number            | The maximum number of top entities to display prominently.                  |

## Methods

| Name                 | Parameters                                  | Return Type | Description                                                                 |
|----------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback    |                                             | void        | Extends the base connectedCallback to set the maximum number of top entities based on group ID and log activity. |
| updated              | changedProperties: Map<string \| number \| symbol, unknown> | void        | Extends the base updated method.                                            |
| disconnectedCallback |                                             | void        | Extends the base disconnectedCallback to log activity.                      |
| render               |                                             | unknown     | Renders the current state of the element, based on the active entity or sub-problem index. |
| renderSubProblemScreen | subProblem: IEngineSubProblem             | unknown     | Renders the screen for a specific sub-problem, including its entities and their effects. |
| renderEntityScreen   | entity: IEngineAffectedEntity               | unknown     | Renders the screen for a specific entity, including the problem statement and sub-problems. |

## Events

None specified.

## Example

```typescript
import '@policysynth/webapp/policies/ps-entities.js';

// Usage within a LitElement template
html`
  <ps-entities .memory=${this.problemMemory}></ps-entities>
`;
```

This example demonstrates how to use the `ps-entities` custom element within another LitElement component, passing the problem memory data to it.