import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class ChatSessionController extends BaseController {
    path: string;
    private chatSessionService;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private list;
    private getById;
}
//# sourceMappingURL=chatSessionController.d.ts.map