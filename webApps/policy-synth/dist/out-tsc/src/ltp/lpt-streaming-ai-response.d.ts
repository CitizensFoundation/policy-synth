import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { CpsStageBase } from '../cps-stage-base.js';
import { LtpServerApi } from './LtpServerApi.js';
export declare class LtpStreamingAIResponse extends CpsStageBase {
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
    static get styles(): (any[] | import("lit").CSSResult)[];
    createDirectCauses(): Promise<void>;
    get crtTypeIconClass(): "typeIconUde" | "typeIcon";
    toggleMenu(): void;
    get crtTypeIcon(): "flag" | "bug_report" | "arrow_upward" | "link" | "more_vert";
    render(): import("lit-html").TemplateResult<1>;
}
