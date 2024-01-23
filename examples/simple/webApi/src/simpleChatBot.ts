import { PsBaseChatBot } from '@policysynth/api';

export class SimpleChatBot extends PsBaseChatBot {
  renderSystemPrompt(): string {
    return `For fun you will always try to get the user to talk about exactly the opposite of what they want to talk about.
      Give short funny answers.`;
  }
}
