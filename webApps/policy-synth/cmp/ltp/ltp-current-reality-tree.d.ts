import { PropertyValueMap } from 'lit';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import { PsStageBase } from '../base/ps-stage-base.js';
import './ltp-current-reality-tree-node.js';
import { LtpServerApi } from './LtpServerApi.js';
export declare class LtpCurrentRealityTree extends PsStageBase {
    crtData?: LtpCurrentRealityTreeData;
    private graph;
    private paper;
    private elements;
    private selection;
    private panning;
    private lastClientX;
    private lastClientY;
    private debounce;
    api: LtpServerApi;
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
    private highlightBranch;
    getParentNodes: (nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes?: LtpCurrentRealityTreeDataNode[]) => LtpCurrentRealityTreeDataNode[] | undefined;
    private findParentNode;
    private isParentNode;
    private findNode;
    private initializeJointJS;
    private applyDirectedGraphLayout;
    private centerParentNodeOnScreen;
    private updatePaperSize;
    private createElement;
    private updateGraphWithCRTData;
    private createLink;
    private selectElement;
    private highlightCell;
    exportToDrawioXml(): void;
    private unhighlightCell;
    getNode(id: string): LtpCurrentRealityTreeDataNode | null;
    getAllCausesExcept(idsToExclude: string[]): LtpCurrentRealityTreeDataNode[];
    addNodes(parentNodeId: string, nodes: LtpCurrentRealityTreeDataNode[]): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    pan(direction: string): void;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ltp-current-reality-tree.d.ts.map