import { PropertyValueMap } from 'lit';
import { dia } from '@joint/core';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import './ps-agent-node.js';
import './ps-connector-node.js';
import { PsServerApi } from './PsServerApi.js';
import { PsBaseWithRunningAgentObserver } from '../base/PsBaseWithRunningAgent.js';
export declare class PsOperationsView extends PsBaseWithRunningAgentObserver {
    currentAgent: PsAgentAttributes;
    private graph;
    private paper;
    private elements;
    private selection;
    private panning;
    private lastClientX;
    private lastClientY;
    private debounce;
    api: PsServerApi;
    constructor();
    connectedCallback(): Promise<void>;
    private zoom;
    private zoomIn;
    private zoomOut;
    private resetZoom;
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    addNodesEvent(event: CustomEvent<any>): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    private handleNodeDoubleClick;
    jointNamespace: {};
    private createLink;
    private initializeJointJS;
    private applyDirectedGraphLayout;
    private centerParentNodeOnScreen;
    private updatePaperSize;
    createAgentElement(agent: PsAgentAttributes): dia.Element;
    createConnectorElement(connector: PsAgentConnectorAttributes, sourceAgent: PsAgentAttributes): dia.Element | null;
    getUniqueConnectorId(connector: PsAgentConnectorAttributes): string;
    getUniqueAgentId(agent: PsAgentAttributes): string;
    updateGraphWithAgentData(): void;
    private selectElement;
    private highlightCell;
    private unhighlightCell;
    addNodes(parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[]): void;
    static get styles(): any[];
    pan(direction: string): void;
    renderHeader(): import("lit").TemplateResult<1>;
    stop(): void;
    start(): void;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-operations-view.d.ts.map