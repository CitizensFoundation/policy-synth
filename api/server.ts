import './models/index.js';
import { App } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { ProjectsController } from './controllers/projectsController.js';
import { TreeController } from './controllers/treeController.js';

const app = new App(
  [
    ProjectsController,
    AnalyticsController,
    TreeController,
  ],
  8000,
);

app.listen();