import '@policysynth/agents/dbModels/sequelize.js';
import { PolicySynthApiApp } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { ProjectsController } from './controllers/projectsController.js';
import { TreeController } from './controllers/treeController.js';
import { AgentsController } from './controllers/agentsController.js';

const app = new PolicySynthApiApp(
  [
    ProjectsController,
    AnalyticsController,
    TreeController,
    AgentsController
  ],
  8000,
);

app.listen();