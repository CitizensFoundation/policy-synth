import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class LinkController extends BaseController {
    path: string;
    private linkService;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private listLinks;
    private getLink;
    private createLink;
    private updateLink;
    private deleteLink;
}
//# sourceMappingURL=linkController.d.ts.map