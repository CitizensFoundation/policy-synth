import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { dia, shapes, util, highlighters, V, layout } from 'jointjs';
import dagre from 'dagre';

import { CpsStageBase } from '../cps-stage-base.js';

import './ltp-current-reality-tree-node.js';
import { LtpServerApi } from './LtpServerApi.js';

type Cell = dia.Element | dia.Link;

const TESTING = false;

class MyShapeView extends dia.ElementView {
  render() {
    super.render();
    const htmlMarkup = this.model.get('markup');

    // Create a foreignObject with a set size and style
    const foreignObject = V('foreignObject', {
      width: this.model.attributes.nodeType === 'ude' ? 185 : 185,
      height: this.model.attributes.nodeType === 'ude' ? 135 : 107,
      style: 'overflow: visible; display: block;',
    }).node;

    // Append the foreignObject to this.el
    V(this.el).append(foreignObject);

    // Defer the addition of the inner div with the HTML content
    setTimeout(() => {
      const div = document.createElement('div');
      div.setAttribute('class', 'html-element');
      div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      div.style.width =
        this.model.attributes.nodeType === 'ude' ? '185px' : '185px';
      div.style.height =
        this.model.attributes.nodeType === 'ude' ? '135px' : '107px';
      div.className = `causeContainer ${
        this.model.attributes.isRootCause ? 'rootCauseContainer' : ''
      } ${this.model.attributes.nodeType == 'ude' ? 'udeContainer' : ''}`;
      div.innerHTML = `<ltp-current-reality-tree-node
        nodeId="${this.model.attributes.nodeId}"
        crtId="${this.model.attributes.crtId}"
        crtNodeType="${this.model.attributes.nodeType}"
        ${this.model.attributes.isRootCause ? 'isRootCause=1' : ''}
        causeDescription="${this.model.attributes.label}"
      >
      </ltp-current-reality-tree-node>`;

      // Append the div to the foreignObject
      foreignObject.appendChild(div);

      // Force layout recalculation and repaint
      foreignObject.getBoundingClientRect();
    }, 0); // A timeout of 0 ms defers the execution until the browser has finished other processing

    this.update();
    return this;
  }
}

class MyShape extends shapes.devs.Model {
  defaults() {
    return util.deepSupplement(
      {
        type: 'html.MyShape',
        attrs: {},
        markup: '<div></div>',
      },
      shapes.devs.Model.prototype.defaults
    );
  }

  view = MyShapeView;
}

@customElement('ltp-current-reality-tree')
export class LtpCurrentRealityTree extends CpsStageBase {
  @property({ type: Object }) crtData?: LtpCurrentRealityTreeData;
  private graph: dia.Graph;
  private paper: dia.Paper;
  private elements: { [key: string]: dia.Element } = {};
  private selection: dia.Element | null = null;
  private panning = false;
  private lastClientX = 0;
  private lastClientY = 0;

  api: LtpServerApi;

  constructor() {
    super();
    this.api = new LtpServerApi();
  }

  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`CRT - open`);

    this.addEventListener('add-nodes', this.addNodesEvent as EventListener);
    this.addGlobalListener(
      'add-nodes',
      this.addNodesEvent.bind(this) as EventListener
    );
  }

  private zoomIn(): void {
    const currentScale = this.paper.scale();
    this.paper.scale(currentScale.sx * 1.1, currentScale.sy * 1.1);
  }

  private zoomOut(): void {
    const currentScale = this.paper.scale();
    this.paper.scale(currentScale.sx * 0.9, currentScale.sy * 0.9);
  }

  private resetZoom(): void {
    this.paper.scale(1, 1);
  }

  addNodesEvent(event: CustomEvent<any>) {
    this.addNodes(event.detail.parentNodeId, event.detail.nodes);
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.initializeJointJS();
    this.paper.el.addEventListener('wheel', (event) => {
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
      // Prevent the default scroll behavior
      event.preventDefault();
    });
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('crtData') && this.crtData) {
      this.updateGraphWithCRTData(this.crtData);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`CRT - close`);
  }

  jointNamespace = {};

  private async initializeJointJS(): Promise<void> {
    const paperContainer = this.shadowRoot?.getElementById(
      'paper-container'
    ) as HTMLElement;

    if (!paperContainer) {
      console.error('Paper container not found');
      return;
    }

    this.graph = new dia.Graph({}, { cellNamespace: this.jointNamespace });
    this.paper = new dia.Paper({
      //@ts-ignore
      elementView: () => MyShapeView,
      el: paperContainer,
      model: this.graph,
      cellViewNamespace: this.jointNamespace,
      width: '100%',
      height: '100%',
      gridSize: 10,
      panning: {
        enabled: false,           // Initially disabled
        modifiers: 'mouseMiddle', // Enable panning with the middle mouse button
      },
      async: true,
      frozen: true,
      sorting: dia.Paper.sorting.APPROX,
      background: { color: 'var(--md-sys-color-surface)' },
      clickThreshold: 10,
      defaultConnector: {
        name: 'rounded',
        // Add attributes for the arrowheads to point upwards
      },
      defaultRouter: {
        name: 'orthogonal',
        args: {
          // Make sure the links go from bottom to top
          startDirections: ['bottom'],
          endDirections: ['top'],
        },
      },
    });

    this.paper.on('element:pointerclick', elementView => {
      this.selectElement((elementView as any).model as dia.Element);
    });

    this.paper.on('blank:pointerclick', () => this.selectElement(null));

    // Initialize SVG styles for the paper
    V(paperContainer as any).prepend(
      V('style', {
        type: 'text/css',
      }).text(`
        .joint-element .selection {
            stroke: var(--md-sys-color-surface);
        }
        .joint-link .selection {
            stroke: var(--md-sys-color-surface);
            stroke-dasharray: 5;
            stroke-dashoffset: 10;
            animation: dash 0.5s infinite linear;
        }
        @keyframes dash {
            to {
                stroke-dashoffset: 0;
            }
        }
      `)
    );

    Object.assign(this.jointNamespace, {
      myShapeGroup: {
        MyShape,
        MyShapeView,
      },
      standard: {
        Rectangle: shapes.standard.Rectangle,
      },
    });

    this.paper.unfreeze();
    this.updatePaperSize();

    await this.updateComplete;

    const paperEl = this.paper.el;

  paperEl.addEventListener('mousedown', (event: MouseEvent) => {
    // Middle mouse button is pressed
    if (event.button === 1) {
      this.panning = true;
      this.lastClientX = event.clientX;
      this.lastClientY = event.clientY;
      paperEl.style.cursor = 'move'; // Optional: Change the cursor to a move icon
      event.preventDefault(); // Prevent any default behavior
    }
  });

  paperEl.addEventListener('mousemove', (event: MouseEvent) => {
    if (this.panning) {
      const dx = event.clientX - this.lastClientX;
      const dy = event.clientY - this.lastClientY;

      this.lastClientX = event.clientX;
      this.lastClientY = event.clientY;

      // Manually apply the translation to the paper's viewport
      const currentTranslate = this.paper.translate();
      this.paper.translate(currentTranslate.tx + dx, currentTranslate.ty + dy);
    }
  });

  // Listen for mouse up on the paper element itself
  paperEl.addEventListener('mouseup', (event: MouseEvent) => {
    if (this.panning && event.button === 1) {
      this.panning = false;
      paperEl.style.cursor = 'default'; // Reset the cursor
    }
  });

  // Optionally, listen for the mouse leaving the paper area to also cancel panning
  paperEl.addEventListener('mouseleave', (event: MouseEvent) => {
    if (this.panning) {
      this.panning = false;
      paperEl.style.cursor = 'default'; // Reset the cursor
    }
  });

  }

  private applyDirectedGraphLayout(): void {
    layout.DirectedGraph.layout(this.graph, {
      setLinkVertices: true,
      align: 'DR',
      ranker: 'tight-tree',
      rankDir: 'BT', // Adjust as needed
      marginX: 50,
      marginY: 20,
      nodeSep: 120,
      edgeSep: 120,
      rankSep: 120,
    });

    // Additional manual adjustments if needed
    this.graph.getElements().forEach(element => {
      // Adjust positions manually if necessary
    });

    // Translate the graph to ensure consistency in positioning
    const bbox = this.graph.getBBox();
    const diffX = 100 - bbox.x - bbox.width / 2;
    const diffY = 100 - bbox.y - bbox.height / 2;
    this.graph.translate(diffX, diffY);

    this.updatePaperSize();
  }

  private updatePaperSize(): void {
    if (!this.paper) {
      console.warn('Paper not initialized');
      return;
    }

    // Automatically adjust the viewport to fit all the content
    this.paper.transformToFitContent({
      padding: 15,
      minScaleX: 0.1,
      minScaleY: 0.1,
      maxScaleX: 2,
      maxScaleY: 2,
      preserveAspectRatio: true,
      contentArea: this.graph.getBBox(),
      verticalAlign: 'top',
      horizontalAlign: 'middle',
    });
  }

  private createElement(node: LtpCurrentRealityTreeDataNode): dia.Element {
    //@ts-ignore
    const el = new MyShape({
      // position: { x: Math.random() * 600, y: Math.random() * 400 },
      label: node.description,
      text: node.description,
      nodeId: node.id,
      nodeType: node.type,
      crtId: this.crtData?.id,
      isRootCause: node.isRootCause,
      attrs: {
        //cause: node.description,
      },
      type: 'html.Element',
    });
    el.addTo(this.graph);
    return el;
  }

  private updateGraphWithCRTData(crtData: LtpCurrentRealityTreeData): void {
    // Clear the existing graph elements
    this.graph.clear();
    this.elements = {};

    console.error(
      'Updating graph with CRT data:',
      JSON.stringify(crtData, null, 2)
    ); // Log the entire data being processed

    // Function to recursively create elements/nodes
    const createNodes = (nodeData: LtpCurrentRealityTreeDataNode) => {
      console.log('Creating node for:', nodeData.id); // Log the ID of the node being processed

      const el = this.createElement(nodeData);
      this.elements[nodeData.id] = el;

      const processChildren = (children: LtpCurrentRealityTreeDataNode[]) => {
        children.forEach(childNode => {
          createNodes(childNode); // Recursive call
        });
      };

      if (nodeData.andChildren) {
        processChildren(nodeData.andChildren);
      }
      if (nodeData.orChildren) {
        processChildren(nodeData.orChildren);
      }
    };

    // Create all elements/nodes
    crtData.nodes.forEach(createNodes);

    // Create links for all 'andChildren' and 'orChildren'
    const createLinks = (
      source: dia.Element,
      children: LtpCurrentRealityTreeDataNode[]
    ) => {
      children.forEach(childNode => {
        const targetElement = this.elements[childNode.id];
        if (!targetElement) {
          console.error(
            `Target element not found for node ID: ${childNode.id}`
          );
          return;
        }

        console.log('Creating link from', source.id, 'to', childNode.id); // Log the source and target IDs
        this.createLink(source, targetElement);

        // Recursively create links for nested children
        if (childNode.andChildren) {
          createLinks(targetElement, childNode.andChildren);
        }
        if (childNode.orChildren) {
          createLinks(targetElement, childNode.orChildren);
        }
      });
    };

    crtData.nodes.forEach(node => {
      const sourceElement = this.elements[node.id];
      if (node.andChildren) {
        createLinks(sourceElement, node.andChildren);
      }
      if (node.orChildren) {
        createLinks(sourceElement, node.orChildren);
      }
    });

    setTimeout(() => {
      this.applyDirectedGraphLayout();
    }, 1500);
  }

  // Function to create a link/edge
  private createLink(source: dia.Element, target: dia.Element): dia.Link {
    if (!source || !target) {
      console.error(`source or target is null ${source} ${target}`);
      return;
    }
    const l = new shapes.standard.Link({
      source: { id: target.id },
      target: { id: source.id },
      attrs: {
        '.connection': {
          stroke: 'var(--md-sys-color-on-surface)',
          'stroke-width': 2,
        },
        '.marker-target': {
          fill: 'var(--md-sys-color-on-surface)',
          d: 'M 10 -5 L 0 0 L 10 5 z',
          // Make sure the marker is at the start of the path (bottom of the source)
          'ref-x': 0.5,
          'ref-y': 0,
        },
      },
      z: 1,
      router: {
        name: 'orthogonal',
        args: {
          startDirections: ['top'],
          endDirections: ['bottom'],
        },
      },
      connector: { name: 'rounded' },
    });

    this.graph.addCell(l);
    return l;
  }

  private selectElement(el: dia.Element | null): void {
    debugger;
    // Deselect the current selection if any
    if (this.selection) {
      this.unhighlightCell(this.selection);
      this.graph.getLinks().forEach(link => this.unhighlightCell(link));
    }

    // Select and highlight the new element
    if (el) {
      this.highlightCell(el);
      this.selection = el;
    } else {
      this.selection = null;
    }
  }

  private highlightCell(cell: Cell): void {
    const view = cell.findView(this.paper);
    if (view) {
      highlighters.addClass.add(
        view,
        cell.isElement() ? 'body' : 'line',
        'selection',
        { className: 'selection' }
      );
    }
  }

  private unhighlightCell(cell: Cell): void {
    const view = cell.findView(this.paper);
    if (view) {
      highlighters.addClass.remove(view, 'selection');
    }
  }

  addNodes(parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[]): void {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      console.error('No nodes provided to add');
      return;
    }

    const findAndUpdateParentNode = (
      nodeDataArray: LtpCurrentRealityTreeDataNode[],
      parentNodeId: string
    ) => {
      for (const nodeData of nodeDataArray) {
        if (nodeData.id === parentNodeId) {
          // Found the parent node, update its andChildren
          nodeData.andChildren = nodeData.andChildren || [];
          nodeData.andChildren.push(...nodes);
          return true;
        }
        // Recursively search in andChildren and orChildren
        if (
          nodeData.andChildren &&
          findAndUpdateParentNode(nodeData.andChildren, parentNodeId)
        )
          return true;
        if (
          nodeData.orChildren &&
          findAndUpdateParentNode(nodeData.orChildren, parentNodeId)
        )
          return true;
      }
      return false;
    };

    // Start the search from the root nodes
    if (!findAndUpdateParentNode(this.crtData.nodes, parentNodeId)) {
      console.error(`Parent node with ID ${parentNodeId} not found in crtData`);
      return;
    }

    const parentNode = this.elements[parentNodeId];

    if (!parentNode) {
      console.error(`Parent node with ID ${parentNodeId} not found`);
      return;
    }

    nodes.forEach(node => {
      node.andChildren = [];
      node.orChildren = [];
      const newNode = this.createElement(node);
      this.elements[node.id] = newNode;

      // Create a link from the parent node to the new node
      this.createLink(parentNode, newNode);
    });

    this.applyDirectedGraphLayout();
  }

  static get styles() {
    return [
      super.styles,
      css`
        .causeContainer {
          color: var(--md-sys-color-on-secondary-container);
          background-color: var(--md-sys-color-secondary-container);
          border-radius: 16px;
          padding: 0;
        }

        .rootCauseContainer {
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          border-radius: 8px;
          padding: 0;
        }

        .udeContainer {
          color: var(--md-sys-color-on-tertiary-container);
          background-color: var(--md-sys-color-tertiary-container);
          border-radius: 8px;
          padding: 0;
        }

        /* Define your component styles here */
        .jointJSCanvas {
          width: 100vw !important;
          height: 100vh !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          /* styles for the JointJS canvas */
        }
      `,
    ];
  }

  render() {
    return html`
       <div class="zoom-controls">
      <button @click="${this.zoomIn}">Zoom In</button>
      <button @click="${this.zoomOut}">Zoom Out</button>
      <button @click="${this.resetZoom}">Reset Zoom</button>
    </div>
      <div class="jointJSCanvas" id="paper-container"></div> `;
  }
}
