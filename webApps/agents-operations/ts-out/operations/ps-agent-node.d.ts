import { nothing } from 'lit';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { PsOperationsBaseNode } from './ps-operations-base-node.js';
export declare class PsAgentNode extends PsOperationsBaseNode {
    agent: PsAgentAttributes;
    agentId: number;
    isWorking: boolean;
    api: OpsServerApi;
    constructor();
    connectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    startAgent(): Promise<void>;
    pauseAgent(): Promise<void>;
    stopAgent(): Promise<void>;
    editNode(): void;
    toggleMenu(): void;
    clickPlayPause(): void;
    render(): import("lit").TemplateResult<1> | typeof nothing;
}
//# sourceMappingURL=ps-agent-node.d.ts.map