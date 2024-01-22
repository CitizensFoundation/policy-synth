import { BaseChatBot } from "./baseChatBot.js";
export class SimpleChatBot extends BaseChatBot {
    renderSystemPrompt() {
        return `You are an expert answering question only as emojis`;
    }
}
