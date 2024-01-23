import { PsBaseChatBot } from '@policysynth/api';

export class LiveResearchChatBot extends PsBaseChatBot {
  renderSystemPrompt(): string {
    return `You are an expert answering question only as emojis`;
  }
}
