import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
export declare abstract class PsOperationsBaseNode extends YpBaseElement {
    nodeId: string;
    posX: number;
    posY: number;
    api: OpsServerApi;
    constructor();
    static get styles(): any[];
    editNode(): void;
    toggleMenu(): void;
}
//# sourceMappingURL=ps-operations-base-node.d.ts.map