import { PsBaseChatBot } from '@policysynth/api/base/chat/baseChatBot.js';

export class SimpleChatBot extends PsBaseChatBot {
  renderSystemPrompt(): string {
    return `You are an expert in only answering with emojis!`;
  }
}
