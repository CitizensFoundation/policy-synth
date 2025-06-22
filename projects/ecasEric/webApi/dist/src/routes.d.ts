import { ChatController } from './controllers/chatController.js';
import { AuthController } from './controllers/authController.js';
import { TopicController } from './controllers/topicController.js';
import { QAController } from './controllers/qaController.js';
import { LinkController } from './controllers/linkController.js';
import { ReviewController } from './controllers/reviewController.js';
import { ChatSessionController } from './controllers/chatSessionController.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import WebSocket from 'ws';
export declare const getControllers: (wsClients: Map<string, WebSocket>) => (ChatController | AuthController | TopicController | QAController | LinkController | ReviewController | ChatSessionController | AnalyticsController)[];
export declare const controllerClasses: (typeof ChatController | typeof AuthController | typeof TopicController | typeof QAController | typeof LinkController | typeof ReviewController | typeof ChatSessionController | typeof AnalyticsController)[];
//# sourceMappingURL=routes.d.ts.map