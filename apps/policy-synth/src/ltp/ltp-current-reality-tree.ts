import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { dia, shapes, highlighters, V } from 'jointjs';

import { CpsStageBase } from '../cps-stage-base.js';
import { IEngineConstants } from '../constants.js';
type Cell = dia.Element | dia.Link;

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
            cause: 'Cause 1',
            andChildren: [
              {
                id: '1.1',
                cause: 'Cause 1.1',
                andChildren: [
                  {
                    id: '1.1.1',
                    cause: 'Cause 1.1.1',
                  },
                  {
                    id: '1.1.2',
                    cause: 'Cause 1.1.2',
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

  private initializeJointJS(): void {
    const paperContainer = this.shadowRoot?.getElementById(
      'paper-container'
    ) as HTMLElement;

    if (!paperContainer) {
      console.error('Paper container not found');
      return;
    }

    this.graph = new dia.Graph({}, { cellNamespace: shapes });
    this.paper = new dia.Paper({
      el: paperContainer,
      model: this.graph,
      cellViewNamespace: shapes,
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
      },
      defaultRouter: {
        name: 'manhattan',
        args: {
          step: 10,
          endDirections: ['bottom'],
          startDirections: ['top'],
          padding: { bottom: 20 },
        },
      },
    });

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

    this.paper.unfreeze();
  }

  private updateGraphWithCRTData(crtData: LtpCurrentRealityTreeData): void {
    // Clear the existing graph elements
    this.graph.clear();
    this.elements = {};

    // Function to create an element/node
    const createElement = (
      node: LtpCurrentRealityTreeDataNode
    ): dia.Element => {
      const el = new shapes.standard.Rectangle({
        position: { x: Math.random() * 600, y: Math.random() * 400 }, // Random positioning for demonstration; replace with your layout logic
        size: { width: 100, height: 60 },
        attrs: {
          label: {
            text: node.cause,
            fontFamily: 'sans-serif',
          },
          body: {
            fill: node.isRootCause ? '#ffcccc' : '#ccccff',
            stroke: '#666',
          },
        },
        z: 2,
      });
      this.graph.addCell(el);
      return el;
    };

    // Function to create a link/edge
    const createLink = (source: dia.Element, target: dia.Element): dia.Link => {
      if (!source || !target) {
        console.error(`source or target is null ${source} ${target}`);
        return;
      }
      const l = new shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: {
          line: {
            stroke: '#333333',
            strokeWidth: 2,
            targetMarker: {
              type: 'path',
              d: 'M 10 -5 0 0 10 5 z',
            },
          },
        },
        z: 1,
      });
      this.graph.addCell(l);
      return l;
    };

    // Create elements for all nodes
    crtData.nodes.forEach(node => {
      this.elements[node.id] = createElement(node);
    });

    // Create links for all 'andChildren' and 'orChildren'
    crtData.nodes.forEach(node => {
      const sourceElement = this.elements[node.id];
      if (!sourceElement) {
        console.error(`Source element not found for node ID: ${node.id}`);
        return;
      }


      const createLinks = (children: LtpCurrentRealityTreeDataNode[]) => {
        children.forEach(childNode => {
          console.log(`Creating link: Source ID - ${node.id}, Target ID - ${childNode.id}`);
          console.log(`Source exists: ${this.elements[node.id] !== undefined}`);
          console.log(`Target exists: ${this.elements[childNode.id] !== undefined}`);
           const targetElement = this.elements[childNode.id];
          if (!targetElement) {
            console.error(`Target element not found for node ID: ${childNode.id}`);
            return;
          }
          createLink(sourceElement, targetElement);
        });
      };

      if (node.andChildren) {
        createLinks(node.andChildren);
      }
      if (node.orChildren) {
        createLinks(node.orChildren);
      }
    });

    this.paper.on('element:pointerclick', elementView =>
      this.selectElement((elementView as any).model as dia.Element)
    );
    this.paper.on('blank:pointerclick', () => this.selectElement(null));
  }

  private selectElement(el: dia.Element | null): void {
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
    // Implement a simple layout algorithm or use a JointJS layout plugin
    // This is a placeholder for layout logic; you'll need to implement this according to your needs
    const padding = 10; // Adjust padding as needed
    let x = padding,
      y = padding;

    for (const key in this.elements) {
      if (this.elements.hasOwnProperty(key)) {
        const el = this.elements[key];
        el.position(x, y);
        x += el.size().width + padding; // Adjust position calculations as needed
        if (x + el.size().width + padding > this.paper.options.width) {
          x = padding;
          y += el.size().height + padding;
        }
      }
    }

    this.paper.unfreeze(); // Unfreeze the paper to render the layout
  }

  static get styles() {
    return [
      super.styles,
      css`
        /* Define your component styles here */
        .jointJSCanvas {
          height: 800px !important;
          width: 1200px !important;
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
