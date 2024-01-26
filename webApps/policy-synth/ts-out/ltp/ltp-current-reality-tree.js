var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { dia, shapes, util, highlighters, V, layout } from 'jointjs';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import { PsStageBase } from '../base/ps-stage-base.js';
import './ltp-current-reality-tree-node.js';
import "./ltp-current-reality-tree-connector.js";
import { LtpServerApi } from './LtpServerApi.js';
const TESTING = false;
const nodeConnectionTypes = ["and", "xor", "mag"];
class MyShapeView extends dia.ElementView {
    render() {
        //@ts-ignore
        super.render();
        //@ts-ignore
        const htmlMarkup = this.model.get("markup");
        //TODO: Make TS work here
        const nodeType = this.model.attributes.nodeType;
        let foreignObjectWidth, foreignObjectHeight;
        if (nodeConnectionTypes.includes(nodeType)) {
            foreignObjectWidth = 90;
            foreignObjectHeight = 40;
        }
        else {
            foreignObjectWidth = nodeType === "ude" ? 185 : 185;
            foreignObjectHeight = nodeType === "ude" ? 107 : 107;
        }
        // Create a foreignObject with a set size and style
        const foreignObject = V("foreignObject", {
            width: foreignObjectWidth,
            height: foreignObjectHeight,
            style: "overflow: visible; display: block;",
        }).node;
        // Append the foreignObject to this.el
        //@ts-ignore
        V(this.el).append(foreignObject);
        // Defer the addition of the inner div with the HTML content
        setTimeout(() => {
            const div = document.createElement("div");
            div.setAttribute("class", "html-element");
            div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
            if (nodeConnectionTypes.includes(nodeType)) {
                div.style.width = "90px";
                div.style.height = "40px";
                div.className = "connectorContainer";
                div.innerHTML = `<ltp-current-reality-tree-connector
          nodeId="${this.model.attributes.nodeId}"
          crtId="${this.model.attributes.crtId}"
          crtNodeType="${this.model.attributes.nodeType}"
        >
        </ltp-current-reality-tree-connector>`;
            }
            else {
                div.style.width = nodeType === "ude" ? "185px" : "185px";
                div.style.height = nodeType === "ude" ? "107px" : "107px";
                div.className = `causeContainer  ${
                //@ts-ignore
                this.model.attributes.isRootCause ? "rootCauseContainer" : ""} ${nodeType == "assumption"
                    ? "assumptionCauseContainer"
                    : ""} ${nodeType == "ude" ? "udeContainer" : ""}`;
                div.innerHTML = `<ltp-current-reality-tree-node
          nodeId="${this.model.attributes.nodeId}"
          crtId="${this.model.attributes.crtId}"
          crtNodeType="${this.model.attributes.nodeType}"
          ${this.model.attributes.isRootCause ? "isRootCause=1" : ""}
          causeDescription="${this.model.attributes.label}"
        >
        </ltp-current-reality-tree-node>`;
            }
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
    constructor() {
        super(...arguments);
        this.view = MyShapeView;
    }
    defaults() {
        return util.deepSupplement({
            type: 'html.MyShape',
            attrs: {},
            markup: '<div></div>',
        }, 
        //@ts-ignore
        shapes.devs.Model.prototype.defaults);
    }
}
let LtpCurrentRealityTree = class LtpCurrentRealityTree extends PsStageBase {
    constructor() {
        super();
        this.elements = {};
        this.selection = null;
        this.panning = false;
        this.lastClientX = 0;
        this.lastClientY = 0;
        this.jointNamespace = {};
        this.getParentNodes = (nodes, // Pass in crt.nodes here
        currentNodeId, parentNodes = []) => {
            for (const node of nodes) {
                // Check if the current node is a direct child of this node
                const isDirectChild = node.children?.some((child) => child.id === currentNodeId);
                if (isDirectChild) {
                    parentNodes.push(node);
                    // Call recursively with the parent node's ID
                    return this.getParentNodes(nodes, node.id, parentNodes);
                }
                // Recursively check in children
                const childrenResult = node.children
                    ? this.getParentNodes(node.children, currentNodeId, parentNodes)
                    : undefined;
                if (childrenResult) {
                    if (!parentNodes.includes(node)) {
                        parentNodes.push(node);
                    }
                    return parentNodes;
                }
            }
            return parentNodes.length === 0 ? undefined : parentNodes;
        };
        this.findParentNode = (nodes, childId) => {
            console.log(`Finding parent for child ID: ${childId}`);
            for (const node of nodes) {
                console.log(`Checking if node ID: ${node.id} is parent of ${childId}`);
                if (this.isParentNode(node, childId)) {
                    console.log(`Found parent ID: ${node.id} for child ID: ${childId}`);
                    return node;
                }
                // Check if any children have the node as a child
                const foundParentInChildren = node.children
                    ? this.findParentNode(node.children, childId)
                    : null;
                if (foundParentInChildren) {
                    return foundParentInChildren;
                }
            }
            console.log(`No parent found for child ID: ${childId}`);
            return null;
        };
        this.isParentNode = (node, childId) => {
            // Check in 'children'
            if (node.children && node.children.some((child) => child.id === childId)) {
                return true;
            }
            // Not found in this node's direct children
            return false;
        };
        this.findNode = (nodes, id) => {
            for (const node of nodes) {
                console.log(`Checking node ID: ${node.id}`);
                if (node.id === id) {
                    console.log(`Node found with ID: ${id}`);
                    return node;
                }
                if (node.children) {
                    const foundInChildren = this.findNode(node.children, id);
                    if (foundInChildren) {
                        console.log(`Node found in 'children' with ID: ${id}`);
                        return foundInChildren;
                    }
                }
            }
            console.log(`No node found with ID: ${id}`);
            return null;
        };
        this.api = new LtpServerApi();
    }
    async connectedCallback() {
        super.connectedCallback();
        window.psAppGlobals.activity(`CRT - open`);
        this.addEventListener('add-nodes', this.addNodesEvent);
        this.addGlobalListener('add-nodes', this.addNodesEvent.bind(this));
        window.addEventListener('resize', () => {
            this.updatePaperSize();
        });
    }
    zoom(factor, x, y) {
        // Get the current scale and calculate the new scale based on the zoom factor
        const currentScale = this.paper.scale().sx; // sx and sy should be the same
        const newScale = currentScale * factor;
        // Calculate the new position for the origin
        const paperRect = this.paper.getComputedSize(); // Get dimensions of the paper
        const centerX = x - paperRect.width / 2;
        const centerY = y - paperRect.height / 2;
        const beta = factor - 1;
        const offsetX = (centerX * beta) / factor;
        const offsetY = (centerY * beta) / factor;
        // Apply the scaling and translation adjustments
        this.paper.translate(this.paper.translate().tx - offsetX, this.paper.translate().ty - offsetY);
        this.paper.scale(newScale, newScale);
    }
    zoomIn() {
        const center = this.paper.getComputedSize(); // or another way to get center
        this.zoom(1.1, center.width / 2, center.height / 2);
    }
    zoomOut() {
        const center = this.paper.getComputedSize(); // or another way to get center
        this.zoom(0.9, center.width / 2, center.height / 2);
    }
    resetZoom() {
        // Reset the origin before resetting the scale
        this.paper.scale(1, 1);
    }
    firstUpdated(_changedProperties) {
        this.initializeJointJS();
        //@ts-ignore
        this.paper.el.addEventListener('wheel', event => {
            if (!event.shiftKey) {
                return; // Only zoom if the Shift key is held down
            }
            event.preventDefault(); // Prevent default scrolling behavior
            // Clear the previous timeout if it exists
            if (this.debounce) {
                clearTimeout(this.debounce);
            }
            // Set a new timeout for the zoom function
            this.debounce = window.setTimeout(() => {
                const localPoint = this.paper.clientToLocalPoint({
                    x: event.offsetX,
                    y: event.offsetY,
                });
                const newScale = event.deltaY < 0 ? 1.05 : 0.95; // Smaller factors for smoother zoom
                this.zoom(newScale, localPoint.x, localPoint.y);
            }, 5); // Debounce zoom calls to every 50ms
        });
    }
    addNodesEvent(event) {
        this.addNodes(event.detail.parentNodeId, event.detail.nodes);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has("crtData") && this.crtData) {
            this.paper.freeze();
            this.updateGraphWithCRTData(this.crtData);
            this.paper.unfreeze();
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`CRT - close`);
    }
    handleNodeDoubleClick(element, zoomOut = false) {
        const bbox = element.getBBox();
        if (zoomOut) {
            const centerX = (bbox.x + bbox.width / 2) * this.paper.scale().sx;
            const centerY = (bbox.y + bbox.height / 2) * this.paper.scale().sy;
            const currentScale = this.paper.scale().sx; // Assuming sx and sy are the same
            // Depending on your needs, adjust the zoom-out factor, this example halves the scale
            const zoomFactor = 1 / 4;
            const newScale = Math.max(this.paper.options.zoom.min, currentScale * zoomFactor);
            // Zoom out, centered on the clicked node
            this.zoom(newScale, centerX, centerY);
        }
        else {
            // Existing logic for zooming in
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            // Zoom in to 2x scale, centered on the double-clicked node
            this.zoom(2, centerX, centerY);
        }
    }
    highlightBranch(element) {
        // Fade all nodes by adding the fadeAway class
        this.graph.getElements().forEach(el => {
            const view = el.findView(this.paper);
            if (view) {
                // Toggle the class off and on to restart the animation
                //@ts-ignore
                view.el.classList.remove('fadeAway');
                // Force a reflow
                //@ts-ignore
                void view.el.getBoundingClientRect();
                // Re-add the fadeAway class to restart the animation
                //@ts-ignore
                view.el.classList.add('fadeAway');
            }
        });
        // Assuming crtData is always updated with the full tree data
        //@ts-ignore
        const parents = this.getParentNodes(this.crtData.nodes, element.attributes.nodeId);
        if (parents) {
            // Remove the fade class from the element being highlighted
            const view = element.findView(this.paper);
            if (view) {
                //@ts-ignore
                view.el.classList.remove('fadeAway');
            }
            // Remove fade from the nodes in the parents array
            parents.forEach(node => {
                const element = this.elements[node.id];
                if (!element) {
                    return;
                }
                const view = element.findView(this.paper);
                if (view) {
                    //@ts-ignore
                    view.el.classList.remove('fadeAway');
                }
            });
        }
    }
    async initializeJointJS() {
        const paperContainer = this.shadowRoot?.getElementById('paper-container');
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
            width: "100%",
            height: "100%",
            gridSize: 20,
            panning: {
                enabled: false, // Initially disabled
                modifiers: 'mouseMiddle', // Enable panning with the middle mouse button
            },
            zoom: {
                enabled: true, // Initially disabled
                mousewheel: false, // Enable mouse wheel zooming
                wheelEnabled: true, // Enable touchpad pinch zooming
                max: 2, // Set max zoom level
                min: 0.2, // Set min zoom level
                step: 0.2, // Set zoom step increment
            },
            async: true,
            frozen: true,
            sorting: dia.Paper.sorting.APPROX,
            background: { color: 'var(--md-sys-color-surface)' },
            clickThreshold: 10,
            defaultConnector: {
                name: "normal",
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
            debugger;
            //      this.selectElement((elementView as any).model as dia.Element);
        });
        this.paper.on('element:pointerdblclick', (cellView, evt) => {
            //@ts-ignore
            const element = cellView.model;
            if (evt.shiftKey) {
                // Handle zoom out with Shift key held down
                this.handleNodeDoubleClick(element, true); // Passing true for zooming out
            }
            if (evt.shiftKey && evt.ctrlKey) {
                // Handle zoom in if Shift key is not held down
                this.handleNodeDoubleClick(element);
            }
            else {
                this.highlightBranch(element);
            }
        });
        this.paper.on('blank:pointerclick', (elementView, evt) => {
            //this.updatePaperSize();
        });
        // Initialize SVG styles for the paper
        V(paperContainer).prepend(V('style', {
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
      `));
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
        //@ts-ignore
        const paperEl = this.paper.el;
        paperEl.addEventListener('mousedown', (event) => {
            // Middle mouse button is pressed
            if (event.button === 1) {
                this.panning = true;
                this.lastClientX = event.clientX;
                this.lastClientY = event.clientY;
                paperEl.style.cursor = 'move'; // Optional: Change the cursor to a move icon
                event.preventDefault(); // Prevent any default behavior
            }
        });
        paperEl.addEventListener('mousemove', (event) => {
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
        paperEl.addEventListener('mouseup', (event) => {
            if (this.panning && event.button === 1) {
                this.panning = false;
                paperEl.style.cursor = 'default'; // Reset the cursor
            }
        });
        // Optionally, listen for the mouse leaving the paper area to also cancel panning
        paperEl.addEventListener('mouseleave', (event) => {
            if (this.panning) {
                this.panning = false;
                paperEl.style.cursor = 'default'; // Reset the cursor
            }
        });
    }
    applyDirectedGraphLayout() {
        layout.DirectedGraph.layout(this.graph, {
            setLinkVertices: true,
            align: "UR",
            ranker: "longest-path",
            rankDir: "BT", // Adjust as needed
            marginX: 20,
            marginY: 40,
            nodeSep: 120,
            edgeSep: 120,
            rankSep: 80,
        });
        // Additional manual adjustments if needed
        this.graph.getElements().forEach(element => {
            // Adjust positions manually if necessary
        });
        // Translate the graph to ensure consistency in positioning
        const bbox = this.graph.getBBox();
        //@ts-ignore
        const diffX = 100 - bbox.x - bbox.width / 2;
        //@ts-ignore
        const diffY = 100 - bbox.y - bbox.height / 2;
        this.graph.translate(diffX, diffY);
        //this.updatePaperSize();
    }
    centerParentNodeOnScreen(parentNodeId) {
        const parentNode = this.elements[parentNodeId];
        if (!parentNode) {
            console.error(`Parent node with ID ${parentNodeId} not found.`);
            return;
        }
        // First, we need to get the current scale so that we can account for it in our calculations
        const currentScale = this.paper.scale().sx; // Assuming uniform scaling for simplicity; sx and sy are the same
        // Fetch the bounding box of the parent node (which includes sub-elements like labels)
        const parentNodeBBox = parentNode.getBBox();
        // Compute the dimensions of the paper's visible area
        const paperSize = this.paper.getComputedSize();
        // Calculate the center of the parent node's bounding box in the coordinates of the current viewport
        const bboxCenterX = parentNodeBBox.x + parentNodeBBox.width / 2;
        const bboxCenterY = parentNodeBBox.y + parentNodeBBox.height / 2;
        // Calculate the center of the paper's visible area
        const paperCenterX = paperSize.width / 2;
        const paperCenterY = paperSize.height / 2;
        // Calculate the desired translation to put the center of the bounding box in the center of the paper
        // We need to account for the current scale because the translation is in unscaled coordinates
        const desiredTx = paperCenterX - bboxCenterX * currentScale;
        const desiredTy = paperCenterY - bboxCenterY * currentScale;
        // Translate the paper by the calculated amount
        this.paper.translate(desiredTx - 107 / 2, desiredTy - 185 / 2);
    }
    updatePaperSize() {
        if (!this.paper) {
            console.warn("Paper not initialized");
            return;
        }
        // Automatically adjust the viewport to fit all the content
        this.paper.transformToFitContent({
            padding: 78,
            minScaleX: 0.2,
            minScaleY: 0.2,
            maxScaleX: 1.1,
            maxScaleY: 1.1,
            preserveAspectRatio: true,
            //@ts-ignore
            contentArea: this.graph.getBBox(),
            verticalAlign: "top",
            horizontalAlign: "middle",
        });
    }
    createElement(node) {
        //@ts-ignore
        const el = new MyShape({
            // position: { x: Math.random() * 600, y: Math.random() * 400 },
            label: node.description,
            text: node.description,
            nodeId: node.id,
            nodeType: node.type,
            crtId: this.crtData?.id,
            isRootCause: node.type == "rootCause",
            attrs: {
            //cause: node.description,
            },
            type: 'html.Element',
        });
        el.addTo(this.graph);
        return el;
    }
    updateGraphWithCRTData(crtData) {
        // Clear the existing graph elements
        this.graph.clear();
        this.elements = {};
        const renderedNodes = new Set();
        const createNodes = (nodeData) => {
            // Skip node creation if already rendered
            if (renderedNodes.has(nodeData.id)) {
                return;
            }
            const el = this.createElement(nodeData);
            this.elements[nodeData.id] = el;
            renderedNodes.add(nodeData.id); // Mark this node as rendered
            if (nodeData.children) {
                nodeData.children.forEach((childNode) => {
                    createNodes(childNode); // Recursive call
                });
            }
        };
        // Create links between nodes and their children
        const createLinks = (sourceId, children) => {
            children.forEach((childNode) => {
                const targetElement = this.elements[childNode.id];
                if (!targetElement) {
                    console.error(`Target element not found for node ID: ${childNode.id}`);
                    return;
                }
                // Create a link only if it doesn't already exist to avoid duplicates
                if (!this.graph.getCell(childNode.id)) {
                    this.createLink(this.elements[sourceId], targetElement);
                }
                if (childNode.children) {
                    createLinks(childNode.id, childNode.children); // Recursive call
                }
            });
        };
        // Process each node in the CRT data
        crtData.nodes.forEach((node) => {
            createNodes(node); // Create node elements
        });
        crtData.nodes.forEach((node) => {
            if (node.children) {
                createLinks(node.id, node.children); // Create links
            }
        });
        // Apply layout and update paper size after processing nodes and links
        setTimeout(() => {
            this.applyDirectedGraphLayout();
            this.updatePaperSize();
        });
    }
    // Function to create a link/edge
    createLink(source, target) {
        if (!source || !target) {
            console.error(`source or target is null ${source} ${target}`);
            //@ts-ignore
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
    selectElement(el) {
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
        }
        else {
            this.selection = null;
        }
    }
    highlightCell(cell) {
        const view = cell.findView(this.paper);
        if (view) {
            highlighters.addClass.add(view, cell.isElement() ? 'body' : 'line', 'selection', { className: 'selection' });
        }
    }
    exportToDrawioXml() {
        const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
        const mxfileHeader = `<mxfile host="app.diagrams.net" modified="2021-05-17T17:18:48.774Z" version="14.6.13" type="device">`;
        const diagramStart = `<diagram name="Page-1" id="example-diagram-id">`;
        const graphModelStart = `<mxGraphModel grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" background="#ffffff">`;
        const rootStart = `<root><mxCell id="0" /><mxCell id="1" parent="0" />`;
        const createDrawioXmlNode = (node) => {
            const position = node.position();
            const size = node.size();
            //@ts-ignore
            return `<mxCell id="${node.id}" value="${node.attributes.label}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
                    <mxGeometry x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" as="geometry" />
                </mxCell>`;
        };
        const createDrawioXmlLink = (link) => {
            return `<mxCell id="${link.id}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="${link.source().id}" target="${link.target().id}">
                    <mxGeometry relative="1" as="geometry" />
                </mxCell>`;
        };
        let drawioXml = `${xmlHeader}${mxfileHeader}${diagramStart}${graphModelStart}${rootStart}`;
        // Export nodes
        this.graph.getElements().forEach((element) => {
            drawioXml += createDrawioXmlNode(element);
        });
        // Export links
        this.graph.getLinks().forEach((link) => {
            drawioXml += createDrawioXmlLink(link);
        });
        const xmlFooter = `</root></mxGraphModel></diagram></mxfile>`;
        drawioXml += xmlFooter;
        // Convert the XML string to a Blob
        const blob = new Blob([drawioXml], { type: 'application/xml' });
        // Create a download link and trigger the download
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "graph.drawio"; // Name the file
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    unhighlightCell(cell) {
        const view = cell.findView(this.paper);
        if (view) {
            highlighters.addClass.remove(view, 'selection');
        }
    }
    getNode(id) {
        const findNode = (nodes, nodeId) => {
            for (const node of nodes) {
                if (node.id === nodeId) {
                    return node;
                }
                if (node.children) {
                    const foundNode = findNode(node.children, nodeId);
                    if (foundNode)
                        return foundNode;
                }
            }
            return null;
        };
        return this.crtData ? findNode(this.crtData.nodes, id) : null;
    }
    getAllCausesExcept(idsToExclude) {
        const excludedTypes = ["and", "mag", "xor", "ude"];
        const renderedNodeIds = new Set();
        const traverseNodes = (nodes, result = []) => {
            nodes.forEach((node) => {
                if (!excludedTypes.includes(node.type) &&
                    !idsToExclude.includes(node.id) &&
                    !renderedNodeIds.has(node.id)) {
                    result.push(node);
                    renderedNodeIds.add(node.id);
                }
                if (node.children) {
                    traverseNodes(node.children, result);
                }
            });
            return result;
        };
        if (!this.crtData || !this.crtData.nodes) {
            return [];
        }
        return traverseNodes(this.crtData.nodes);
    }
    addNodes(parentNodeId, nodes) {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            console.error("No nodes provided to add");
            return;
        }
        const findAndUpdateParentNode = (nodeDataArray, parentNodeId, nodesToAdd) => {
            for (const nodeData of nodeDataArray) {
                if (nodeData.id === parentNodeId) {
                    nodeData.children = nodeData.children || [];
                    nodeData.children.push(...nodesToAdd); // Update the data structure with new nodes
                    return true;
                }
                // Recursively search in children
                if (nodeData.children &&
                    findAndUpdateParentNode(nodeData.children, parentNodeId, nodesToAdd)) {
                    return true;
                }
            }
            return false;
        };
        // Find the parent node in the data structure and update it with the new nodes
        if (!findAndUpdateParentNode(this.crtData.nodes, parentNodeId, nodes)) {
            console.error(`Parent node with ID ${parentNodeId} not found in crtData`);
            return;
        }
        // Function to add a node and its children to the graph
        const addNodeAndChildren = (parentNode, nodeData) => {
            const newNode = this.createElement(nodeData);
            this.elements[nodeData.id] = newNode;
            this.createLink(parentNode, newNode);
            if (nodeData.children && nodeData.children.length > 0) {
                nodeData.children.forEach((childNode) => addNodeAndChildren(newNode, childNode));
            }
        };
        // Find the parent node element in the graph
        const parentNodeElement = this.elements[parentNodeId];
        if (!parentNodeElement) {
            console.error(`Parent node element with ID ${parentNodeId} not found`);
            return;
        }
        // Add each node and its children
        nodes.forEach((node) => {
            addNodeAndChildren(parentNodeElement, node);
        });
        this.applyDirectedGraphLayout();
        setTimeout(() => {
            this.centerParentNodeOnScreen(parentNodeId);
        }, 10);
    }
    static get styles() {
        return [
            super.styles,
            css `
        .causeContainer {
          color: var(--md-sys-color-on-primary-container);
          background-color: var(--md-sys-color-primary-container);
          border-radius: 16px;
          padding: 0;
        }

        .rootCauseContainer {
          color: var(--md-sys-color-on-primary);
          background-color: var(--md-sys-color-primary);
          border-radius: 0;
          padding: 0;
        }

        .connectorContainer {
          color: var(--md-sys-color-on-secondary-container);
          background-color: var(--md-sys-color-secondary-container);
          border-radius: 0;
          padding: 0;
        }

        .udeContainer {
          color: var(--md-sys-color-on-tertiary-container);
          background-color: var(--md-sys-color-tertiary-container);
          border-radius: 8px;
          padding: 0;
        }

        .assumptionCauseContainer {
          color: var(--md-sys-color-on-secondary-container);
          background-color: var(--md-sys-color-secondary-container);
          border-radius: 16px;
          padding: 0;
        }

        /* Define your component styles here */
        .jointJSCanvas {
          width: 100vw !important;
          height: calc(100vh - 90px) !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          /* styles for the JointJS canvas */
        }

        .controlPanel {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          margin: 0 0;
          width: 100%;
          position: absolute;
          top: 64px;
          left: 0;
          width: 100%;
          height: 56px;
          padding: 0;
          padding-top: 4px;
          opacity: 1;
          background: transparent;
          color: var(--md-sys-color-on-surface-variant);
        }

        .controlPanelContainer {
          margin: 0 0;
          position: absolute;
          top: 64px;
          left: 0;
          width: 100%;
          height: 62px;
          padding: 0;
          opacity: 0.65;
          background: var(--md-sys-color-surface-variant);
        }

        md-filled-tonal-icon-button {
          margin-left: 8px;
          margin-right: 8px;
        }

        .firstButton {
          margin-left: 16px;
        }

        .lastButton {
          margin-right: 16px;
        }

        @keyframes fadeAwayAnimation {
          0% {
            opacity: 1;
          }
          8% {
            opacity: 0.1;
          }
          100% {
            opacity: 1;
          }
        }

        .fadeAway {
          animation: fadeAwayAnimation 60.5s;
        }

        .downloadButton {
          margin-right: 28px;
        }
      `,
        ];
    }
    pan(direction) {
        const currentTranslate = this.paper.translate();
        let dx = 0;
        let dy = 0;
        switch (direction) {
            case 'left':
                dx = 25;
                break;
            case 'right':
                dx = -25;
                break;
            case 'up':
                dy = 25;
                break;
            case 'down':
                dy = -25;
                break;
        }
        this.paper.translate(currentTranslate.tx + dx, currentTranslate.ty + dy);
    }
    render() {
        return html `
      <div class="controlPanelContainer"></div>
      <div class="controlPanel">
        <md-filled-tonal-icon-button @click="${this.zoomIn}" class="firstButton"
          ><md-icon>zoom_in</md-icon></md-filled-tonal-icon-button
        >
        <md-filled-tonal-icon-button @click="${this.zoomOut}"
          ><md-icon>zoom_out</md-icon></md-filled-tonal-icon-button
        >
        <md-filled-tonal-icon-button @click="${this.resetZoom}"
          ><md-icon>center_focus_strong</md-icon></md-filled-tonal-icon-button
        >
        <md-filled-tonal-icon-button @click="${this.updatePaperSize}"
          ><md-icon>zoom_out_map</md-icon></md-filled-tonal-icon-button
        >

        <div class="flex"></div>

        <md-icon-button @click="${() => this.pan('left')}"
          ><md-icon>arrow_back</md-icon></md-icon-button
        >

        <md-icon-button @click="${() => this.pan('up')}"
          ><md-icon>arrow_upward</md-icon></md-icon-button
        >

        <md-icon-button @click="${() => this.pan('down')}"
          ><md-icon>arrow_downward</md-icon></md-icon-button
        >

        <md-icon-button @click="${() => this.pan('right')}" class="lastButton"
          ><md-icon>arrow_forward</md-icon></md-icon-button
        >
        <div class="flex"></div>

        <md-icon-button class="downloadButton" @click="${this.exportToDrawioXml}"
          ><md-icon>download</md-icon></md-icon-button
        >
      </div>
      <div class="jointJSCanvas" id="paper-container"></div>
    `;
    }
};
__decorate([
    property({ type: Object })
], LtpCurrentRealityTree.prototype, "crtData", void 0);
LtpCurrentRealityTree = __decorate([
    customElement('ltp-current-reality-tree')
], LtpCurrentRealityTree);
export { LtpCurrentRealityTree };
//# sourceMappingURL=ltp-current-reality-tree.js.map