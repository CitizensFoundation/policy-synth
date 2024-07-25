import '@policysynth/agents/dbModels/sequelize.js';
import { PolicySynthApiApp } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { AgentsController } from './controllers/agentsController.js';

const app = new PolicySynthApiApp(
  [
    AnalyticsController,
    AgentsController
  ],
  8000,
);

app.listen();