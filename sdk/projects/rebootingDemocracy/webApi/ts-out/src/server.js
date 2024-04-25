import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import { ChatController } from './controllers/chatController.js';
const app = new PolicySynthApiApp([
    AnalyticsController,
    ChatController
], 9080);
app.listen();
