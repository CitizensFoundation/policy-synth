import { PolicySynthApiApp } from '@policysynth/api';
const app = new PolicySynthApiApp([
    simpleChatBotController,
], 8000);
app.listen();
