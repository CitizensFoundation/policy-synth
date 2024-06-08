import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/circular-progress.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";
import { LtpServerApi } from "./OpsServerApi.js";
import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element.js";
export declare class PsPlaygroundConnector extends YpBaseElement {
    nodeId: string;
    crtNodeType: CrtNodeType;
    crtId: string;
    isCreatingCauses: boolean;
    api: LtpServerApi;
    constructor();
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): any[];
    editNode(): void;
    toggleMenu(): void;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-operations-connector.d.ts.map