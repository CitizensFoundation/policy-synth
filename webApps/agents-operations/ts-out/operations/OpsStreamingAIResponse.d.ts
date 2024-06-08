import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { OpsServerApi } from './OpsServerApi.js';
import { YpCodeBase } from '@yrpri/webapp/common/YpCodeBaseclass.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
export declare class OpsStreamingAIResponse extends YpCodeBase {
    wsClientId: string;
    targetContainer: HTMLElement | HTMLInputElement | undefined;
    caller: YpBaseElement;
    api: OpsServerApi;
    ws: WebSocket;
    isActive: boolean;
    constructor(caller: YpBaseElement, targetContainer?: HTMLElement | HTMLInputElement | undefined);
    close(): void;
    connect(): Promise<string>;
    onWsOpen(event: Event, resolve: (wsClientId: string) => void): void;
    onMessage(event: MessageEvent): void;
}
//# sourceMappingURL=OpsStreamingAIResponse.d.ts.map