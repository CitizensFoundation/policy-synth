import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import { LtpServerApi } from './LtpServerApi.js';
import { YpBaseElement, YpCodeBase } from '@yrpri/webapp';
export declare class LtpStreamingAIResponse extends YpCodeBase {
    wsClientId: string;
    targetContainer: HTMLElement | HTMLInputElement | undefined;
    caller: YpBaseElement;
    api: LtpServerApi;
    ws: WebSocket;
    isActive: boolean;
    constructor(caller: YpBaseElement, targetContainer?: HTMLElement | HTMLInputElement | undefined);
    close(): void;
    connect(): Promise<string>;
    onWsOpen(event: Event, resolve: (wsClientId: string) => void): void;
    onMessage(event: MessageEvent): void;
}
//# sourceMappingURL=LtpStreamingAIResponse.d.ts.map