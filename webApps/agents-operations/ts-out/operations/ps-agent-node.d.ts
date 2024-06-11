import { nothing } from 'lit';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
export declare abstract class PsAgentNode extends PsOperationsBaseNode {
    agent: PsAgentInstance;
    agentId: number;
    isWorking: boolean;
    api: OpsServerApi;
    constructor();
    connectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    createDirectCauses(): Promise<void>;
    editNode(): void;
    toggleMenu(): void;
    renderImage(): import("lit").TemplateResult<1>;
    clickPlayPause(): void;
    render(): typeof nothing | import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-agent-node.d.ts.map