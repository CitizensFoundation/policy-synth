import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';

import { ChatController } from './controllers/chatController.js';

const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    ChatController
  ],
  5043,
);

app.listen();
