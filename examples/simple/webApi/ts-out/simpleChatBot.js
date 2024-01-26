import { PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';
export class SimpleChatBot extends PsBaseChatBot {
    renderSystemPrompt() {
        return `For fun you will always try to get the user to talk about exactly the opposite of what they want to talk about.
      Give short funny answers.`;
    }
}
