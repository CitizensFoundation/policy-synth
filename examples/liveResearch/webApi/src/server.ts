import { AnalyticsController, PolicySynthApiApp } from '@policysynth/api';
import { LiveResearchChatController } from './controllers/liveResearchChatController.js';

const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    LiveResearchChatController
  ],
  5021,
);

app.listen();
