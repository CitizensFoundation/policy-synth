# LtpCurrentRealityTree

This class represents the current reality tree component in a policy synthesis web application. It extends `PsStageBase` and utilizes the JointJS library to render and manipulate a graph representing the current reality tree (CRT). The class provides functionality for adding nodes, creating links, zooming, panning, and exporting the graph to Draw.io XML format.

## Properties

| Name     | Type                                      | Description                                      |
|----------|-------------------------------------------|--------------------------------------------------|
| crtData  | LtpCurrentRealityTreeData \| undefined   | Optional property to hold the current reality tree data. |

## Methods

| Name                        | Parameters                                                                 | Return Type | Description                                                                                   |
|-----------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| zoom                        | factor: number, x: number, y: number                                       | void        | Zooms the paper based on the given factor and coordinates.                                    |
| zoomIn                      |                                                                            | void        | Zooms into the paper.                                                                         |
| zoomOut                     |                                                                            | void        | Zooms out of the paper.                                                                       |
| resetZoom                   |                                                                            | void        | Resets the zoom level to the default scale.                                                   |
| addNodesEvent               | event: CustomEvent<any>                                                    | void        | Handles the 'add-nodes' event to add nodes to the graph.                                      |
| handleNodeDoubleClick       | element: dia.Element, zoomOut: boolean = false                             | void        | Handles double-click events on nodes for zooming or highlighting branches.                    |
| highlightBranch             | element: dia.Element                                                       | void        | Highlights the branch of the clicked node.                                                    |
| getParentNodes              | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] = [] | LtpCurrentRealityTreeDataNode[] \| undefined | Recursively finds the parent nodes of a given node.                                           |
| findParentNode              | nodes: LtpCurrentRealityTreeDataNode[], childId: string                    | LtpCurrentRealityTreeDataNode \| null | Finds the parent node of a given child node.                                                  |
| isParentNode                | node: LtpCurrentRealityTreeDataNode, childId: string                       | boolean     | Checks if a node is the parent of a given child node.                                         |
| findNode                    | nodes: LtpCurrentRealityTreeDataNode[], id: string                         | LtpCurrentRealityTreeDataNode \| null | Finds a node by its ID.                                                                       |
| initializeJointJS           |                                                                            | Promise<void> | Initializes the JointJS graph and paper.                                                      |
| applyDirectedGraphLayout    |                                                                            | void        | Applies a directed graph layout to the graph.                                                 |
| centerParentNodeOnScreen    | parentNodeId: string                                                       | void        | Centers the parent node on the screen.                                                        |
| updatePaperSize             |                                                                            | void        | Updates the paper size to fit the content.                                                    |
| createElement               | node: LtpCurrentRealityTreeDataNode                                        | dia.Element | Creates a JointJS element for a given node.                                                   |
| updateGraphWithCRTData      | crtData: LtpCurrentRealityTreeData                                         | void        | Updates the graph with the current reality tree data.                                         |
| createLink                  | source: dia.Element, target: dia.Element                                   | dia.Link    | Creates a link between two elements.                                                          |
| selectElement               | el: dia.Element \| null                                                    | void        | Selects and highlights an element.                                                            |
| exportToDrawioXml           |                                                                            | void        | Exports the graph to Draw.io XML format.                                                      |
| unhighlightCell             | cell: Cell                                                                 | void        | Removes the highlight from a cell.                                                            |
| getNode                     | id: string                                                                 | LtpCurrentRealityTreeDataNode \| null | Retrieves a node by its ID.                                                                   |
| getAllCausesExcept          | idsToExclude: string[]                                                     | LtpCurrentRealityTreeDataNode[] | Retrieves all causes except for the specified IDs.                                            |
| addNodes                    | parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[]               | void        | Adds nodes to the graph under a specified parent node.                                        |
| pan                         | direction: string                                                          | void        | Pans the paper in the specified direction.                                                    |

## Events

No events are documented.

## Example

```typescript
import { LtpCurrentRealityTree } from '@policysynth/webapp/ltp/ltp-current-reality-tree.js';

// Example usage of LtpCurrentRealityTree
const crtComponent = document.createElement('ltp-current-reality-tree');
document.body.appendChild(crtComponent);

// Assuming crtData is available
crtComponent.crtData = {
  nodes: [
    {
      id: "1",
      type: "ude",
      description: "UnDesirable Effect",
      children: [
        {
          id: "2",
          type: "cause",
          description: "Cause of UDE",
          children: []
        }
      ]
    }
  ],
  id: "crt1"
};

// Zoom in
crtComponent.zoomIn();

// Add nodes
crtComponent.addNodes("1", [
  {
    id: "3",
    type: "cause",
    description: "Another cause of UDE",
    children: []
  }
]);
```

This example demonstrates how to create an instance of `LtpCurrentRealityTree`, set its `crtData` property, zoom in, and add nodes programmatically.