import { PolicySynthApiApp } from '@policysynth/api';
import { SimpleChatController } from './controllers/simpleChatController.js';
const app = new PolicySynthApiApp([
    SimpleChatController,
], 5011);
app.listen();
