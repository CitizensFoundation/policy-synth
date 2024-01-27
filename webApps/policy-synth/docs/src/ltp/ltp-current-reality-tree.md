# LtpCurrentRealityTree

This class represents the current reality tree component in a policy synthesis web application. It extends `PsStageBase` and utilizes the JointJS library to render a graph-based representation of a problem's current reality, including nodes and connectors that represent causes, effects, and assumptions.

## Properties

| Name     | Type                                      | Description                                                                 |
|----------|-------------------------------------------|-----------------------------------------------------------------------------|
| crtData  | LtpCurrentRealityTreeData \| undefined   | The data for the current reality tree, including nodes and their connections.|

## Methods

| Name                      | Parameters                                                                 | Return Type | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| zoom                      | factor: number, x: number, y: number                                       | void        | Zooms the paper in or out at the specified coordinates by the given factor. |
| zoomIn                    |                                                                            | void        | Zooms into the paper by a predefined factor.                                |
| zoomOut                   |                                                                            | void        | Zooms out of the paper by a predefined factor.                              |
| resetZoom                 |                                                                            | void        | Resets the zoom level to the default scale.                                 |
| addNodesEvent             | event: CustomEvent<any>                                                    | void        | Handles the `add-nodes` event to add nodes to the graph.                    |
| handleNodeDoubleClick     | element: dia.Element, zoomOut: boolean = false                             | void        | Handles double-click events on nodes for zooming or highlighting.           |
| highlightBranch           | element: dia.Element                                                       | void        | Highlights the branch leading to the specified element.                     |
| getParentNodes            | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] = [] | LtpCurrentRealityTreeDataNode[] \| undefined | Recursively finds the parent nodes of a given node.                         |
| findParentNode            | nodes: LtpCurrentRealityTreeDataNode[], childId: string                    | LtpCurrentRealityTreeDataNode \| null | Finds the parent node of a given child node.                                |
| isParentNode              | node: LtpCurrentRealityTreeDataNode, childId: string                       | boolean     | Checks if a node is the parent of a given child node.                       |
| findNode                  | nodes: LtpCurrentRealityTreeDataNode[], id: string                         | LtpCurrentRealityTreeDataNode \| null | Finds a node by its ID.                                                     |
| initializeJointJS         |                                                                            | Promise<void> | Initializes the JointJS graph and paper elements.                           |
| applyDirectedGraphLayout  |                                                                            | void        | Applies a directed graph layout to the JointJS graph.                       |
| centerParentNodeOnScreen  | parentNodeId: string                                                       | void        | Centers the specified parent node on the screen.                            |
| updatePaperSize           |                                                                            | void        | Updates the size of the JointJS paper to fit the content.                   |
| createElement             | node: LtpCurrentRealityTreeDataNode                                        | dia.Element | Creates a JointJS element for a given node.                                 |
| updateGraphWithCRTData    | crtData: LtpCurrentRealityTreeData                                         | void        | Updates the graph with the current reality tree data.                       |
| createLink                | source: dia.Element, target: dia.Element                                   | dia.Link    | Creates a link between two JointJS elements.                                |
| selectElement             | el: dia.Element \| null                                                    | void        | Selects and highlights a JointJS element.                                   |
| exportToDrawioXml         |                                                                            | void        | Exports the graph to a Draw.io XML format.                                  |
| unhighlightCell           | cell: Cell                                                                 | void        | Removes the highlight from a JointJS cell.                                  |
| getNode                   | id: string                                                                 | LtpCurrentRealityTreeDataNode \| null | Retrieves a node by its ID from the current reality tree data.              |
| getAllCausesExcept        | idsToExclude: string[]                                                     | LtpCurrentRealityTreeDataNode[] | Retrieves all causes except for those specified by their IDs.               |
| addNodes                  | parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[]               | void        | Adds nodes to the graph under a specified parent node.                      |
| pan                       | direction: string                                                          | void        | Pans the paper in the specified direction.                                  |

## Events

No events are documented.

## Example

```typescript
import '@policysynth/webapp/ltp/ltp-current-reality-tree.js';

// Example usage of LtpCurrentRealityTree in a LitElement component
class MyComponent extends LitElement {
  render() {
    return html`
      <ltp-current-reality-tree .crtData=${this.crtData}></ltp-current-reality-tree>
    `;
  }
}
```

This example demonstrates how to use the `ltp-current-reality-tree` custom element in a LitElement component, passing the current reality tree data through the `crtData` property.