import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class AuthController extends BaseController {
    path: string;
    private authService;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private login;
}
//# sourceMappingURL=authController.d.ts.map