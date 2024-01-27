import './models/index.js';
import { PolicySynthApiApp } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { ProjectsController } from './controllers/projectsController.js';
import { TreeController } from './controllers/treeController.js';

const app = new PolicySynthApiApp(
  [
    ProjectsController,
    AnalyticsController,
    TreeController,
  ],
  8000,
);

app.listen();