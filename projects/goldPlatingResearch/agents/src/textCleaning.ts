import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";

export class TextCleaningAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;

  maxCleanupTokenLength: number = 4000;
  maxCleanupRetries: number = 15;

  completionValidationSuccessMessage = "All content present in cleaned text.";
  correctnessValidationSuccessMessage = "All content correct in cleaned text.";
  hallucinationValidationSuccessMessage = "No additional content in cleaned text.";

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
  }

  async processItem(textToClean: string): Promise<string> {
    await this.updateRangedProgress(0, "Starting text cleaning process");

    const cleanedText = await this.clean(textToClean);

    await this.updateRangedProgress(100, "Text cleaning completed");
    return cleanedText;
  }

  private async clean(data: string): Promise<string> {
    const splitPartsForCleanup = this.splitDataForProcessing(data, this.maxCleanupTokenLength);

    const cleanedParts = await Promise.all(
      splitPartsForCleanup.map((part, index) => this.cleanPart(part, index, splitPartsForCleanup.length))
    );

    return cleanedParts.join(" ");
  }

  private async cleanPart(part: string, index: number, total: number): Promise<string> {
    await this.updateRangedProgress((index / total) * 100, `Cleaning part ${index + 1} of ${total}`);

    let validated = false;
    let retryCount = 0;
    let cleanedPart = "";
    let validationTextResults: string | undefined;

    while (!validated && retryCount < this.maxCleanupRetries) {
      cleanedPart = await this.callCleaningModel(part, validationTextResults);
      const validationResults = await this.validateCleanedPart(part, cleanedPart);
      validated = validationResults.valid;
      retryCount++;

      if (!validated) {
        this.logger.warn(`Validation failed ${retryCount} times`);
        validationTextResults = validationResults.validationTextResults;
      }
    }

    if (!validated) {
      throw new Error(`Validation failed for part: ${part.slice(0, 100)}...`);
    }

    return cleanedPart;
  }

  private async callCleaningModel(text: string, previousValidationResults?: string): Promise<string> {
    const messages = [
      this.createSystemMessage(this.getCleaningSystemPrompt()),
      this.createHumanMessage(this.getCleaningUserPrompt(text, previousValidationResults))
    ];

    return await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, messages, false) as string;
  }

  private async validateCleanedPart(original: string, cleaned: string): Promise<{ valid: boolean; validationTextResults: string }> {
    const [completionValidation, correctnessValidation, hallucinationValidation] = await Promise.all([
      this.runValidationSubAgent("completion", original, cleaned),
      this.runValidationSubAgent("correctness", original, cleaned),
      this.runValidationSubAgent("hallucination", original, cleaned)
    ]);

    const validationTextResults = `${completionValidation} ${correctnessValidation} ${hallucinationValidation}`;

    const valid =
      completionValidation.includes(this.completionValidationSuccessMessage) &&
      correctnessValidation.includes(this.correctnessValidationSuccessMessage) &&
      hallucinationValidation.includes(this.hallucinationValidationSuccessMessage);

    return { valid, validationTextResults };
  }

  private async runValidationSubAgent(type: "completion" | "correctness" | "hallucination", original: string, cleaned: string): Promise<string> {
    const messages = [
      this.createSystemMessage(this.getValidationSystemPrompt(type)),
      this.createHumanMessage(this.getValidationUserPrompt(original, cleaned))
    ];

    return await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, messages, false) as string;
  }

  private getCleaningSystemPrompt(): string {
    return `You are an expert document cleaner. Your job is to help clean up legal documents coming from various sources.

Instructions:
- Clean up the document and only output actual unchanged contents.
- Do not output any initial acknowledgments, table of contents, page numbers, or any other conversion artifacts.
- Remove all repeated titles as those may come from page headers or footers.
- If the text starts with a numbered index like 1. or 4. do not remove it in your cleanup.
- Do not add anything to the document.
- Remove all lists of references and replace with empty text.
- Remove all lists of URLs with the exception of single URLs that are inline in actual text.
- Combine very short paragraphs into longer paragraphs.
- Split long paragraphs into smaller, more readable paragraphs.
- Do not change the content, just remove unwanted artifacts and reformat paragraphs in the cleanup.`;
  }

  private getCleaningUserPrompt(text: string, previousValidationResults?: string): string {
    return `${previousValidationResults ? `Note: You have already tried to clean up this document, and you got these validation errors:\n${previousValidationResults}\n\n` : ''}
Document to clean up and output in full:
${text}`;
  }

  private getValidationSystemPrompt(type: "completion" | "correctness" | "hallucination"): string {
    switch (type) {
      case "completion":
        return `You are a detailed-oriented text comparison agent.
Instructions:
- Ensure all main content in the original text is present in the cleaned text.
- The cleaned text should not have acknowledgments, table of contents, page numbers, or other conversion artifacts.
- All numbered items in the main content should still be present in the cleaned text.
- References and URL lists should be removed, but inline URLs should remain.
- All HTML tags should be removed.
- If all main content is present, output only: ${this.completionValidationSuccessMessage}`;
      case "correctness":
        return `You are a detailed-oriented text comparison agent.
Instructions:
- Identify anything that is not the same in the original text as in the cleaned text, except for items that have been intentionally cleaned away.
- Do not comment on removed artifacts, fixed typos, or formatting changes.
- If all the cleaned text is correct, output only: ${this.correctnessValidationSuccessMessage}`;
      case "hallucination":
        return `You are a detailed-oriented text comparison agent.
Instructions:
- Identify anything in the cleaned text that is not in the original text.
- The cleaned text should not include any additional content.
- Do not comment on removed text.
- If there is no additional content in the cleaned text, output only: ${this.hallucinationValidationSuccessMessage}`;
    }
  }

  private getValidationUserPrompt(original: string, cleaned: string): string {
    return `<ORIGINAL_TEXT>${original}</ORIGINAL_TEXT>

<CLEANED_TEXT>${cleaned}</CLEANED_TEXT>

Analyze and provide your assessment:`;
  }

  private splitDataForProcessing(data: string, maxLength: number): string[] {
    const words = data.split(/\s+/);
    const result: string[] = [];
    let currentChunk = "";

    for (const word of words) {
      if ((currentChunk + word).length > maxLength) {
        result.push(currentChunk.trim());
        currentChunk = "";
      }
      currentChunk += word + " ";
    }

    if (currentChunk) {
      result.push(currentChunk.trim());
    }

    return result;
  }
}