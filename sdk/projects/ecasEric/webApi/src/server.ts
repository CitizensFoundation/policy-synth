import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';

import { ChatController } from './controllers/chatController.js';
import { EcasYeaServerApi } from './app.js';

const app = new EcasYeaServerApi(
  [
    AnalyticsController,
    ChatController
  ],
  4078,
);

app.listen();
