import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import { ChatController } from './controllers/chatController.js';
const app = new PolicySynthApiApp([
    AnalyticsController,
    ChatController
], 5021);
app.listen();
//# sourceMappingURL=server%20copy.js.map