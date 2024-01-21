# LtpCurrentRealityTree

The `LtpCurrentRealityTree` class is a custom element that represents a current reality tree (CRT) using the JointJS library to render the tree graphically. It extends from `CpsStageBase` and uses various web components and decorators to manage its properties and lifecycle.

## Properties

| Name     | Type                             | Description                                                                 |
|----------|----------------------------------|-----------------------------------------------------------------------------|
| crtData  | LtpCurrentRealityTreeData\|undefined | Optional property to hold the data for the current reality tree.            |

## Methods

| Name                    | Parameters                                  | Return Type | Description                                                                 |
|-------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback       | -                                           | void        | Lifecycle method that runs when the element is added to the document's DOM. |
| zoom                    | factor: number, x: number, y: number        | void        | Zooms the paper view by a given factor at the specified coordinates.        |
| zoomIn                  | -                                           | void        | Zooms in the paper view.                                                    |
| zoomOut                 | -                                           | void        | Zooms out the paper view.                                                   |
| resetZoom               | -                                           | void        | Resets the zoom level of the paper view to its default state.               |
| firstUpdated            | _changedProperties: PropertyValueMap\|Map   | void        | Lifecycle method that runs after the element's first render.                |
| addNodesEvent           | event: CustomEvent                          | void        | Handles the 'add-nodes' event to add nodes to the graph.                    |
| updated                 | changedProperties: Map                      | void        | Lifecycle method that runs when the element's properties change.            |
| disconnectedCallback    | -                                           | void        | Lifecycle method that runs when the element is removed from the DOM.        |
| handleNodeDoubleClick   | element: dia.Element, zoomOut: boolean      | void        | Handles double-click events on nodes for zooming in or out.                 |
| highlightBranch         | element: dia.Element                        | void        | Highlights the branch of the tree that contains the specified element.      |
| initializeJointJS       | -                                           | Promise\<void\> | Initializes the JointJS graph and paper elements.                           |
| applyDirectedGraphLayout| -                                           | void        | Applies a directed graph layout to the JointJS graph.                       |
| centerParentNodeOnScreen| parentNodeId: string                        | void        | Centers the specified parent node in the paper view.                        |
| updatePaperSize         | -                                           | void        | Updates the size of the paper view to fit the content.                      |
| createElement           | node: LtpCurrentRealityTreeDataNode         | dia.Element | Creates a new JointJS element for the given node data.                      |
| updateGraphWithCRTData  | crtData: LtpCurrentRealityTreeData          | void        | Updates the graph with the provided CRT data.                               |
| createLink              | source: dia.Element, target: dia.Element    | dia.Link    | Creates a link between two JointJS elements.                                |
| selectElement           | el: dia.Element\|null                       | void        | Selects and highlights a JointJS element.                                   |
| exportToDrawioXml       | -                                           | void        | Exports the graph to a Draw.io compatible XML format.                       |
| unhighlightCell         | cell: Cell                                  | void        | Removes highlighting from a JointJS cell.                                   |
| getNode                 | id: string                                  | LtpCurrentRealityTreeDataNode\|null | Retrieves a node by its ID from the CRT data.                              |
| getAllCausesExcept      | idsToExclude: string[]                      | LtpCurrentRealityTreeDataNode[] | Retrieves all causes except for those with specified IDs.                   |
| addNodes                | parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[] | void | Adds nodes to the graph under the specified parent node.                    |
| pan                     | direction: string                           | void        | Pans the paper view in the specified direction.                             |
| render                  | -                                           | TemplateResult | Renders the element's HTML template.                                        |

## Events (if any)

- **add-nodes**: Emitted when nodes are added to the graph.

## Examples

```typescript
// Example usage of the LtpCurrentRealityTree web component
<ltp-current-reality-tree .crtData=${myCrtData}></ltp-current-reality-tree>
```

Note: The above example assumes that `myCrtData` is a variable containing the data for the current reality tree.