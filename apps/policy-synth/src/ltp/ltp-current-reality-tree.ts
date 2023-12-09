import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { dia, shapes, util, highlighters, V } from 'jointjs';

import { CpsStageBase } from '../cps-stage-base.js';

import './ltp-current-reality-tree-node.js';

type Cell = dia.Element | dia.Link;

class MyShapeView extends dia.ElementView {
  render() {
    super.render();
    const htmlMarkup = this.model.get('markup');

    // Create a foreignObject with a set size and style
    const foreignObject = V('foreignObject', {
      width: 165,
      height: 76,
      style: 'overflow: visible; display: block;',
    }).node;

    // Append the foreignObject to this.el
    V(this.el).append(foreignObject);

    // Defer the addition of the inner div with the HTML content
    setTimeout(() => {
      const div = document.createElement('div');
      div.setAttribute('class', 'html-element');
      div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      div.style.width = '150px';
      div.style.height = '60px';
      div.className = 'causeContainer';
      div.innerHTML = `<ltp-current-reality-tree-node
        class="causeText"
        nodeId="${this.model.attributes.nodeId}"
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
        markup: '<div>okokoko</div>',
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

  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`CRT - open`);
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.initializeJointJS();
    setTimeout(() => {
      this.crtData = {
        context: 'Context',
        rawPossibleCauses: 'Raw Root Causes',
        undesirableEffects: ['Undesirable Effect 1', 'Undesirable Effect 2'],
        nodes: [
          {
            id: '1',
            cause: 'Fuel is not getting into the engine',
            andChildren: [
              {
                id: '1.1',
                cause: 'There is water in the fuel line',
                andChildren: [
                  {
                    id: '1.1.1',
                    cause: 'The car is in the swimming pool',
                  },
                  {
                    id: '1.1.2',
                    cause: 'Cause 1.1.2',
                  },
                  {
                    id: '1.1.3',
                    cause: 'Cause 1.1.3',
                  },
                ],
              },
              {
                id: '1.2',
                cause: 'Cause 1.2',
              },
            ],
          },
          {
            id: '2',
            cause: 'Cause 2',
            orChildren: [
              {
                id: '2.1',
                cause: 'Cause 2.1',
              },
              {
                id: '2.2',
                cause: 'Cause 2.2',
              },
            ],
          },
          {
            id: '3',
            cause: 'Cause 3',
            orChildren: [
              {
                id: '3.1',
                cause: 'Cause 3.1',
              },
              {
                id: '3.2',
                cause: 'Cause 3.2',
              },
            ],
          },
        ],
      };
    }, 1000);
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

  private initializeJointJS(): void {
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
      async: true,
      frozen: true,
      sorting: dia.Paper.sorting.APPROX,
      background: { color: '#F3F7F6' },
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
            stroke: #ff4468;
        }
        .joint-link .selection {
            stroke: #ff4468;
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
  }

  private createElement(node: LtpCurrentRealityTreeDataNode): dia.Element {
    //@ts-ignore
    const el = new MyShape({
      // position: { x: Math.random() * 600, y: Math.random() * 400 },
      label: node.cause,
      text: node.cause,
      attrs: {
        //cause: node.cause,
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

    console.log('Updating graph with CRT data:', crtData); // Log the entire data being processed

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

    this.layoutGraph();
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
        '.connection': { stroke: '#333333', 'stroke-width': 2 },
        '.marker-target': {
          fill: '#333333',
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

  private layoutGraph(): void {
    const nodeWidth = 150;
    const nodeHeight = 50;
    const verticalSpacing = 130;
    const horizontalSpacing = 40; // You might want to adjust this dynamically based on the tree width
    const topPadding = 60; // Padding at the top of the container

    // Function to get the width of a subtree rooted at a given node
    const getSubtreeWidth = (node: LtpCurrentRealityTreeDataNode): number => {
      let width = nodeWidth;
      if (node.andChildren) {
        width = Math.max(
          width,
          node.andChildren.reduce(
            (acc, child) => acc + getSubtreeWidth(child) + horizontalSpacing,
            0
          ) - horizontalSpacing
        );
      }
      if (node.orChildren) {
        width = Math.max(
          width,
          node.orChildren.reduce(
            (acc, child) => acc + getSubtreeWidth(child) + horizontalSpacing,
            0
          ) - horizontalSpacing
        );
      }
      return width;
    };

    // Recursive function to layout nodes, this will align parents above their children
    const layoutNodes = (
      nodes: LtpCurrentRealityTreeDataNode[],
      x: number,
      y: number
    ) => {
      let xOffset = x;
      nodes.forEach(node => {
        const subtreeWidth = getSubtreeWidth(node);
        const nodeCenterX = xOffset + subtreeWidth / 2;
        this.elements[node.id].position(nodeCenterX - nodeWidth / 2, y);

        if (node.andChildren) {
          layoutNodes(node.andChildren, xOffset, y + verticalSpacing);
        }
        if (node.orChildren) {
          layoutNodes(node.orChildren, xOffset, y + verticalSpacing);
        }
        xOffset += subtreeWidth + horizontalSpacing;
      });
    };

    // Calculate initial x offset to center the tree
    const totalWidth = this.crtData.nodes.reduce(
      (acc, node) => acc + getSubtreeWidth(node) + horizontalSpacing,
      -horizontalSpacing
    );
    console.error(this.paper.options);
    //TODO: Figure this out better
    const initialXOffset = (1600 - totalWidth) / 2;

    //    const initialXOffset = ((this.paper.options as any).width - totalWidth) / 2;

    // Start the layout process
    if (this.crtData && this.crtData.nodes) {
      layoutNodes(this.crtData.nodes, initialXOffset, topPadding); // Start from the centered x position and top padding
    }

    this.paper.unfreeze(); // Unfreeze the paper to render the layout
  }

  static get styles() {
    return [
      super.styles,
      css`
        .causeText {
          font-size: 12px;
          color: var(--md-sys-color-on-primary-container);
        }

        .causeContainer {
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          border-radius: 8px;
          padding: 8px;
        }

        /* Define your component styles here */
        .jointJSCanvas {
          height: 800px !important;
          width: 1600px !important;
          /* styles for the JointJS canvas */
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="layout vertical">
        <div class="title">${this.t('Current Reality Tree')}</div>
        <div class="contextInput"></div>
        <div class="rawRootCausesInput"></div>
        <!-- This is where the JointJS paper should be attached -->
        <div class="jointJSCanvas" id="paper-container"></div>
      </div>
    `;
  }
}
