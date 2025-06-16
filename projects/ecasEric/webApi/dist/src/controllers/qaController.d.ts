import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class QAController extends BaseController {
    path: string;
    private qaService;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private listQAPairs;
    private getQAPair;
    private createQAPair;
    private updateQAPair;
    private deleteQAPair;
    private importXLSX;
}
//# sourceMappingURL=qaController.d.ts.map