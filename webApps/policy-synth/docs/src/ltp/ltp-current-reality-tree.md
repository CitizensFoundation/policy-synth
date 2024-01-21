# LtpCurrentRealityTree

The `LtpCurrentRealityTree` class is a custom element that represents a Current Reality Tree (CRT) using JointJS to render the tree graphically. It extends `CpsStageBase` and integrates with the `LtpServerApi` to interact with a server backend.

## Properties

| Name     | Type                             | Description                                      |
|----------|----------------------------------|--------------------------------------------------|
| crtData  | LtpCurrentRealityTreeData\|undefined | The data for the current reality tree.           |

## Methods

| Name                   | Parameters                                  | Return Type | Description                                                                 |
|------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| zoom                   | factor: number, x: number, y: number        | void        | Zooms the paper view by a given factor at the specified x and y coordinates. |
| zoomIn                 |                                             | void        | Zooms in the paper view.                                                    |
| zoomOut                |                                             | void        | Zooms out the paper view.                                                   |
| resetZoom              |                                             | void        | Resets the zoom level to the default scale.                                 |
| addNodesEvent          | event: CustomEvent<any>                     | void        | Handles the 'add-nodes' event to add nodes to the tree.                     |
| handleNodeDoubleClick  | element: dia.Element, zoomOut: boolean      | void        | Handles double-click events on nodes for zooming and highlighting.          |
| highlightBranch        | element: dia.Element                        | void        | Highlights the branch of the tree that includes the specified element.      |
| initializeJointJS      |                                             | Promise<void> | Initializes the JointJS graph and paper elements.                           |
| applyDirectedGraphLayout |                                           | void        | Applies a directed graph layout to the JointJS graph.                       |
| centerParentNodeOnScreen | parentNodeId: string                      | void        | Centers the specified parent node in the paper view.                        |
| updatePaperSize        |                                             | void        | Updates the size of the paper view to fit the content.                      |
| createElement          | node: LtpCurrentRealityTreeDataNode         | dia.Element | Creates a new JointJS element for the given node data.                      |
| updateGraphWithCRTData | crtData: LtpCurrentRealityTreeData          | void        | Updates the JointJS graph with the provided CRT data.                       |
| createLink             | source: dia.Element, target: dia.Element    | dia.Link    | Creates a link between two JointJS elements.                                |
| selectElement          | el: dia.Element\|null                       | void        | Selects and highlights a JointJS element.                                   |
| exportToDrawioXml      |                                             | void        | Exports the JointJS graph to a Draw.io XML format.                          |
| getNode                | id: string                                  | LtpCurrentRealityTreeDataNode\|null | Retrieves a node by its ID from the CRT data. |
| getAllCausesExcept     | idsToExclude: string[]                      | LtpCurrentRealityTreeDataNode[] | Retrieves all causes except for the specified IDs. |
| addNodes               | parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[] | void | Adds nodes to the specified parent node in the CRT. |
| pan                    | direction: string                           | void        | Pans the paper view in the specified direction.                             |

## Events

- **add-nodes**: Emitted when nodes are added to the tree.

## Examples

```typescript
// Example usage of the LtpCurrentRealityTree custom element
const crtElement = document.createElement('ltp-current-reality-tree');
document.body.appendChild(crtElement);

// Set the CRT data
crtElement.crtData = {
  id: 'crt1',
  nodes: [
    {
      id: 'node1',
      type: 'ude',
      description: 'UnDesirable Effect 1',
      children: [
        {
          id: 'node2',
          type: 'cause',
          description: 'Cause of UDE 1',
        },
      ],
    },
  ],
};

// Add nodes to the CRT
crtElement.addNodes('node1', [
  {
    id: 'node3',
    type: 'cause',
    description: 'Another cause of UDE 1',
  },
]);
```

Note: The above example assumes that the `LtpCurrentRealityTree` custom element has been defined and registered in the custom elements registry.