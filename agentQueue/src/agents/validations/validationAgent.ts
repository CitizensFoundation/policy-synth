import { PsBaseValidationAgent } from "./baseAgent.js";

class PsValidationAgent extends PsBaseValidationAgent {
  renderSystemPrompt() {
    return `

    `;
  }

  renderUserPrompt(input: string) {
    return `
      User:
      ${input}
      `;
  }

  async performExecute(input: string) {


    }
}""