import './models/index.js';
import { App } from './app.js';
import { SimpleChatBotController } from './controllers/simpleChatBotController.js';
import { ProjectsController } from './controllers/projectsController.js';
import { TreeController } from './controllers/treeController.js';

const app = new App(
  [
    simpleChatBotController,
  ],
  8000,
);

app.listen();