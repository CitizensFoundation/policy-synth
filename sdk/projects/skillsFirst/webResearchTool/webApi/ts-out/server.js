import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import { LiveResearchChatController } from './controllers/liveResearchChatController.js';
const app = new PolicySynthApiApp([
    AnalyticsController,
    LiveResearchChatController
], 5029);
app.listen();
