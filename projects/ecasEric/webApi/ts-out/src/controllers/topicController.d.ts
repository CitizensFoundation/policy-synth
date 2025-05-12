import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class TopicController extends BaseController {
    path: string;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private listTopics;
    private getTopic;
    private createTopic;
    private updateTopic;
    private deleteTopic;
}
//# sourceMappingURL=topicController.d.ts.map