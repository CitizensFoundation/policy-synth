import '@policysynth/agents/dbModels/sequelize.js';
import { PolicySynthApiApp } from './app.js';
import { AnalyticsController } from './controllers/analyticsController.js';
const app = new PolicySynthApiApp([
    AnalyticsController,
], 8000);
app.listen();
//# sourceMappingURL=server.js.map