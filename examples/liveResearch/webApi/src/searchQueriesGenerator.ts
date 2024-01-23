import  {PolicySynthAgentBase} from '@policysynth/agents';

export class SearchQueriesGenerator extends PolicySynthAgentBase {
  generateSearchQueriesPrompt: string;

  constructor(generateSearchQueriesPrompt: string) {
    this.generateSearchQueriesPrompt = generateSearchQueriesPrompt;
  }

  async generateSearchQueries() {
    const searchQueries = await this.openaiClient.search.completions.create({
      engine: "davinci",
      prompt: this.generateSearchQueriesPrompt,
      max_tokens: 4000,
      temperature: 0.7,
      stop: ["\n"],
    });

    return searchQueries;
  }
}