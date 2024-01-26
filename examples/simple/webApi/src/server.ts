import { PolicySynthApiApp } from '@policysynth/api/app.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import { SimpleChatController } from './controllers/simpleChatController.js';

const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    SimpleChatController,
  ],
  5011,
);

app.listen();