# LtpCurrentRealityTree

The `LtpCurrentRealityTree` class is a custom element that extends `PsStageBase` and is responsible for rendering and managing a Current Reality Tree (CRT) diagram using the JointJS library. It provides functionality to manipulate the diagram, such as zooming, panning, and adding nodes.

## Properties

| Name     | Type                             | Description                                      |
|----------|----------------------------------|--------------------------------------------------|
| crtData  | LtpCurrentRealityTreeData       | The data for the Current Reality Tree diagram.   |

## Methods

| Name                    | Parameters                                  | Return Type | Description                                                                 |
|-------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| zoom                    | factor: number, x: number, y: number        | void        | Zooms the diagram by a given factor around a point (x, y).                  |
| zoomIn                  |                                             | void        | Zooms in the diagram.                                                       |
| zoomOut                 |                                             | void        | Zooms out the diagram.                                                      |
| resetZoom               |                                             | void        | Resets the zoom level of the diagram to the default scale.                  |
| addNodesEvent           | event: CustomEvent<any>                     | void        | Handles the 'add-nodes' event to add nodes to the diagram.                  |
| handleNodeDoubleClick   | element: dia.Element, zoomOut: boolean      | void        | Handles double-click events on nodes for zooming in or out.                 |
| highlightBranch         | element: dia.Element                        | void        | Highlights the branch of the diagram that contains the specified element.   |
| getParentNodes          | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] | LtpCurrentRealityTreeDataNode[] | Retrieves the parent nodes of a given node in the diagram.                  |
| findParentNode          | nodes: LtpCurrentRealityTreeDataNode[], childId: string | LtpCurrentRealityTreeDataNode | Finds the parent node of a given child node.                                |
| isParentNode            | node: LtpCurrentRealityTreeDataNode, childId: string | boolean     | Checks if a node is the parent of a given child node.                       |
| findNode                | nodes: LtpCurrentRealityTreeDataNode[], id: string | LtpCurrentRealityTreeDataNode | Finds a node in the diagram by its ID.                                      |
| initializeJointJS       |                                             | Promise<void> | Initializes the JointJS diagram.                                            |
| applyDirectedGraphLayout|                                             | void        | Applies a directed graph layout to the diagram.                             |
| centerParentNodeOnScreen| parentNodeId: string                        | void        | Centers the parent node on the screen.                                      |
| updatePaperSize         |                                             | void        | Updates the size of the paper to fit the content.                           |
| createElement           | node: LtpCurrentRealityTreeDataNode        | dia.Element | Creates a new element in the diagram.                                       |
| updateGraphWithCRTData  | crtData: LtpCurrentRealityTreeData         | void        | Updates the graph with the provided CRT data.                               |
| createLink              | source: dia.Element, target: dia.Element    | dia.Link    | Creates a link between two elements in the diagram.                         |
| selectElement           | el: dia.Element \| null                     | void        | Selects an element in the diagram.                                          |
| exportToDrawioXml       |                                             | void        | Exports the diagram to a Draw.io XML format.                                |
| unhighlightCell         | cell: Cell                                  | void        | Unhighlights a cell in the diagram.                                         |
| getNode                 | id: string                                  | LtpCurrentRealityTreeDataNode \| null | Retrieves a node by its ID.                                                |
| getAllCausesExcept      | idsToExclude: string[]                      | LtpCurrentRealityTreeDataNode[] | Retrieves all causes except for the specified IDs.                         |
| addNodes                | parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[] | void | Adds nodes to the diagram.                                                 |
| pan                     | direction: string                           | void        | Pans the diagram in a specified direction.                                  |

## Events (if any)

- **add-nodes**: Emitted when nodes are added to the diagram.

## Examples

```typescript
// Example usage of the LtpCurrentRealityTree component
const crtComponent = document.createElement('ltp-current-reality-tree');
document.body.appendChild(crtComponent);

// Set the CRT data
crtComponent.crtData = {
  nodes: [
    {
      id: '1',
      description: 'Root cause',
      type: 'rootCause',
      children: [
        {
          id: '2',
          description: 'Sub cause',
          type: 'cause',
          children: []
        }
      ]
    }
  ],
  id: 'crt1'
};

// Add nodes to the CRT
crtComponent.addNodes('1', [
  {
    id: '3',
    description: 'New cause',
    type: 'cause',
    children: []
  }
]);
```

Note: The above example assumes that the `LtpCurrentRealityTree` component is already defined and registered as a custom element. The `crtData` property is expected to be of type `LtpCurrentRealityTreeData`, which should be defined elsewhere in the codebase.