import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
export declare class PsOperationsAgent extends YpBaseElement {
    nodeId: string;
    agentClass: PsAgentClass;
    agentId: number;
    api: OpsServerApi;
    constructor();
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): any[];
    createDirectCauses(): Promise<void>;
    editNode(): void;
    get crtTypeIconClass(): "typeIconUde" | "typeIconRoot" | "typeIcon";
    toggleMenu(): void;
    get crtTypeIcon(): "flag" | "bug_report" | "arrow_upward" | "link" | "question_mark" | "more_vert";
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-operations-agent.d.ts.map