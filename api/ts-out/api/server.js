import './models/index.js';
import { App } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
import { ProjectsController } from './controllers/projectsController.js';
import { CurrentRealityTreeController } from './controllers/crtController.js';
const app = new App([
    ProjectsController,
    AnalyticsController,
    CurrentRealityTreeController,
], 8000);
app.listen();
