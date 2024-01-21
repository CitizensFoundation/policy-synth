import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { LtpServerApi } from './LtpServerApi.js';
import { YpBaseElement } from '../@yrpri/common/yp-base-element.js';
export declare class LtpCurrentRealityTreeNode extends YpBaseElement {
    nodeId: string;
    crtNodeType: CrtNodeType;
    crtId: string;
    isRootCause: boolean;
    causeDescription: string;
    isCreatingCauses: boolean;
    api: LtpServerApi;
    constructor();
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): any[];
    createDirectCauses(): Promise<void>;
    editNode(): void;
    get crtTypeIconClass(): "typeIconUde" | "typeIconRoot" | "typeIcon";
    toggleMenu(): void;
    get crtTypeIcon(): "link" | "flag" | "bug_report" | "arrow_upward" | "question_mark" | "more_vert";
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=ltp-current-reality-tree-node.d.ts.map