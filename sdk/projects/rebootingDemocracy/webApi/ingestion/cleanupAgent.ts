import { BaseIngestionAgent } from "./baseAgent.js";
import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class IngestionCleanupAgent extends BaseIngestionAgent {
  maxCleanupTokenLength: number = 4000;
  maxCleanupRetries: number = 15;

  completionValidationSuccessMessage = "All content present in cleaned text.";

  correctnessValidationSuccessMessage = "All content correct in cleaned text.";

  hallucinationValidationSuccessMessage =
    "No additional content in cleaned text.";

  hallucinationValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything in the cleaned text that is not in the original text.
- The cleaned text should not include anything not in the original text.
- Do not comment on removed text.
- If there is no additional text in the cleaned text, then output, and nothing else: No additional content in cleaned text.
`);

  correctnessValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything that is not the same in the original text as in the cleaned text except for items that have been cleaned away.
- Important: The cleaned text does not have any acknowledgments, table of contents, page numers, or any other PDF conversion artifacts, etc and that is ok, do not comment on it.
- Do not comment on fixed typos or such in the cleaned text.
- If all the cleaned text is correct, output, and nothing else: All content correct in cleaned text.
`);

  completionValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Make sure that all main content in the original text is present in the cleaned text, that no main content is missing.
- The cleaned text does not have any acknowledgments, table of contents, page numers, or any other PDF conversion artifacts, etc and that is ok as we have cleaned it away.
- Do not comment on fixed typos or such in the cleaned text.
- Make sure that all numbers used to number items in the main content are still present in the cleaned text.
- All lists of references or list of urls should be removed but all URLs in the should be in the cleaned text.
- All HTML tags should be removed.
- If all the main content is present in the cleaned text then output, and nothing else: All content present in cleaned text.
`);

  validationUserMessage = (original: string, cleaned: string) =>
    new HumanMessage(`<ORIGINAL_TEXT>${original}</ORIGINAL_TEXT>

<CLEANED_TEXT>${cleaned}</CLEANED_TEXT>

Think step by step and output your analysis here:
`);
  systemMessage =
    new SystemMessage(`You are an expert document cleaner. Your job is to help cleanup documents coming from various sources. PDFs, etc.

Instruction:
- We own all copyright to the materials we are cleaning for our RAG chatbot.
- Please cleanup the document and only output actual unchanged contents.
- Do no output any initial acknowledgments, table of contents, page numbers, or any other PDF conversion artifacts, etc.
- Remove all repeated titles as those are coming from the PDF footer pages.
- If the text start with a numbered index like 1. or 4. do not remove it in your cleanup.
- Do not add anything to the document.
- Remove all lists of references
- Remove all lists of urls with the exception of single urls that are inline in actual text that is not a list.
- Bring together sentences into paragraphs as needed.
- Split very long paragraphs into smaller paragraphs by topic.
- Do not change anything just remove unwanted artifacts and reformat paragraphs in the cleanup.
`);

  userMessage = (data: string, validationTextResults: string | undefined) =>
    new HumanMessage(`${validationTextResults ? `Note: You have already tried once to cleanup this document, and you got those validation errors:\n${validationTextResults}\n\n`: ``}
Document to cleanup and output in full:
${data}
`);

  async clean(data: string): Promise<string> {
    let cleanedUpDataParts: string[] = [];
    this.resetLlmTemperature();

    const splitPartsForCleanup = this.splitDataForProcessing(
      data,
      this.maxCleanupTokenLength
    );

    console.log(JSON.stringify(splitPartsForCleanup, null, 2));

    // Write the each chunk sizes to console.log
    splitPartsForCleanup.forEach((part) => {
      console.log(part.length);
    });

    for (const part of splitPartsForCleanup) {
      let validated = false;
      let retryCount = 0;
      let cleanedPart = "";
      let validationTextResults: string | undefined;

      while (!validated && retryCount < this.maxCleanupRetries) {
        console.log(`\n\nCleaning part: ${part}`);
        cleanedPart = (await this.callLLM(
          "ingestion-agent",
          IEngineConstants.ingestionModel,
          this.getFirstMessages(this.systemMessage, this.userMessage(part, validationTextResults)),
          false
        )) as string;

        const validationResults = await this.validateCleanedPart(
          part,
          cleanedPart
        );

        validated = validationResults.valid;

        retryCount++;

        if (!validated) {
          console.warn(`\nValidation failed ${retryCount}\n`);
          validationTextResults = validationResults.validationTextResults;
        }

        if (retryCount > 2) {
          this.randomizeLlmTemperature();
        }
      }

      if (validated) {
        cleanedUpDataParts.push(cleanedPart);
      } else {
        throw new Error(`Validation failed for part: ${part}`);
      }
    }

    return cleanedUpDataParts.join(" ");
  }

  async validateCleanedPart(
    original: string,
    cleaned: string
  ): Promise<{valid: boolean, validationTextResults: string}> {
    console.log(`Validating cleaned part: ${cleaned}`);
    const validations = await Promise.all([
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.completionValidationSystemMessage,
          this.validationUserMessage(original, cleaned)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.correctnessValidationSystemMessage,
          this.validationUserMessage(original, cleaned)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.hallucinationValidationSystemMessage,
          this.validationUserMessage(original, cleaned)
        ),
        false
      ),
    ]);

    const [
      completionValidation,
      correctnessValidation,
      hallucinationValidation,
    ] = validations.map((response) => response as string);

    const validationTextResults = `${completionValidation} ${correctnessValidation} ${hallucinationValidation}`;
    console.log(
      `ņ----------------_> completionValidation: ${validationTextResults}\n\n`
    );

    if (
      completionValidation.includes(this.completionValidationSuccessMessage) &&
      correctnessValidation.includes(this.correctnessValidationSuccessMessage) &&
      hallucinationValidation.includes(this.hallucinationValidationSuccessMessage)
    ) {
      return {valid: true, validationTextResults};
    } else {
      return {valid: false, validationTextResults};
    }
  }
}
