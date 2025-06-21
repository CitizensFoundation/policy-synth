import { BaseIngestionAgent } from "./baseAgent.js";

export class DocumentCleanupAgent extends BaseIngestionAgent {
  maxCleanupTokenLength: number = 4000;
  maxCleanupRetries: number = 15;

  completionValidationSuccessMessage = "All content present in cleaned text.";

  correctnessValidationSuccessMessage = "All content correct in cleaned text.";

  hallucinationValidationSuccessMessage =
    "No additional content in cleaned text.";

  hallucinationValidationSystemMessage =
    this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything in the cleaned text that is not in the original text.
- The cleaned text should not include anything not in the original text.
- Do not comment on removed text.
- If there is no additional text in the cleaned text, then output, and nothing else: No additional content in cleaned text.
`);

  correctnessValidationSystemMessage =
    this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything that is not the same in the original text as in the cleaned text except for items that have been cleaned away.
- Important: The cleaned text does not have any acknowledgments, table of contents, page numers, or any other PDF conversion artifacts, etc and that is ok, do not comment on it.
- Do not comment on fixed typos or such in the cleaned text.
- If all the cleaned text is correct, output, and nothing else: All content correct in cleaned text.
`);

  completionValidationSystemMessage =
    this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Make sure that all main content in the original text is present in the cleaned text, that no main content is missing.
- The cleaned text does not have any acknowledgments, table of contents, page numers, or any other PDF conversion artifacts, etc and that is ok as we have cleaned it away.
- Do not comment on fixed typos or such in the cleaned text.
- Make sure that all numbers used to number items in the main content are still present in the cleaned text.
- All lists of references or list of urls should be removed but all inline URLs in the should be in the cleaned text. The references and lists of urls should be replaced with empty text.
- All HTML tags should be removed.
- If all the main content is present in the cleaned text then output, and nothing else: All content present in cleaned text.
`);

  validationUserMessage = (original: string, cleaned: string) =>
    this.createHumanMessage(`<ORIGINAL_TEXT>${original}</ORIGINAL_TEXT>

<CLEANED_TEXT>${cleaned}</CLEANED_TEXT>

Think step by step and output your analysis here:
`);
  systemMessage =
    this.createSystemMessage(`You are an expert document cleaner. Your job is to help cleanup documents coming from various sources. PDFs, etc.

Instruction:
- We own all copyright to the materials we are cleaning for our RAG chatbot.
- Please cleanup the document and only output actual unchanged contents.
- Do no output any initial acknowledgments, table of contents, page numbers, or any other PDF conversion artifacts, etc.
- Remove all repeated titles as those are coming from the PDF footer pages.
- If the text start with a numbered index like 1. or 4. do not remove it in your cleanup.
- Do not add anything to the document.
- Remove all lists of references and replace with empty text, do not make up text to replace those.
- Remove all lists of urls with the exception of single urls that are inline in actual text that is not a list. Replace those list of urls with empty text do not make up something instead.
- If there are very short paragraphs bring those into longer paragraphs.
- Also, always, split long paragraphs into smaller paragraphs.
- Do not change anything just remove unwanted artifacts and reformat paragraphs in the cleanup.
`);

  userMessage = (data: string, validationTextResults: string | undefined) =>
    this.createHumanMessage(`${
      validationTextResults
        ? `Note: You have already tried once to cleanup this document, and you got those validation errors:\n${validationTextResults}\n\n`
        : ``
    }
Document to cleanup and output in full:
${data}
`);

  referencesCheckSystemMessage =
    this.createSystemMessage(`Please analyze this document if it contains paragraphs, sentences or only a list of references or urls or references with urls.

  If the documents contains only references without text explainations or URLs output, only: ONLY_REFERENCES_OR_URLS

  If the document contains real content with paragraphs, sentences or even just one paragraph output only: PARAGRAPHS
`);

  referencesCheckUserMessage = (data: string) =>
    this.createHumanMessage(`Document to analyze:
${data}

Your one word analysis:
`);

  async clean(data: string): Promise<string> {
    const splitPartsForCleanup = this.splitDataForProcessing(
      data,
      this.maxCleanupTokenLength
    );

    this.logger.info(JSON.stringify(splitPartsForCleanup, null, 2));

    // Normalize parts by joining short parts with the previous ones
    for (let i = 1; i < splitPartsForCleanup.length; i++) {
      if (splitPartsForCleanup[i].length < 1000) {
        splitPartsForCleanup[i - 1] += "\n" + splitPartsForCleanup[i];
        splitPartsForCleanup.splice(i, 1);
        i--; // Adjust index for removed element
      }
    }

    const executing: Promise<string>[] = [];

    // Define an async function for cleaning each part
    const cleanPart = async (part: string, index: number, total: number) => {
      this.logger.info(`\n\nCleaning part: ${index + 1} of ${total}\n\n`);
      this.logShortLines(part);

      let validated = false;
      let retryCount = 0;
      let cleanedPart = "";
      let validationTextResults: string | undefined;

      while (!validated && retryCount < this.maxCleanupRetries) {
        const referenceAnalysis = (await this.callLLM(
          "ingestion-agent",
          this.getFirstMessages(
            this.systemMessage,
            this.userMessage(part, validationTextResults)
          ),
          false
        )) as string;

        if (referenceAnalysis.indexOf("ONLY_REFERENCES_OR_URLS") > -1) {
          this.logger.warn(
            `\n\nONLY_REFERENCES_OR_URLS:\n${part}\nONLY_REFERENCES_OR_URLS\n\n`
          );
          cleanedPart = "";
          validated = true;
        } else {
          cleanedPart = (await this.callLLM(
            "ingestion-agent",
            this.getFirstMessages(
              this.systemMessage,
              this.userMessage(part, validationTextResults)
            ),
            false
          )) as string;

          const validationResults = await this.validateCleanedPart(
            part,
            cleanedPart
          );
          validated = validationResults.valid;
          retryCount++;

          if (!validated) {
            this.logger.warn(`\nValidation failed ${retryCount}\n`);
            validationTextResults = validationResults.validationTextResults;
          }
        }
      }

      if (!validated) {
        throw new Error(`Validation failed for part: ${part}`);
      }

      return cleanedPart;
    };

    // Process chunks with concurrency limit
    const concurrencyLimit = 10;
    const results: Promise<string>[] = [];
    for (const [index, part] of splitPartsForCleanup.entries()) {
      const promise = cleanPart(part, index, splitPartsForCleanup.length).then(
        (cleanedPart: string) => {
          executing.splice(executing.indexOf(promise), 1);
          return cleanedPart; // This promise resolves with a string, matching the declared type
        }
      );

      results.push(promise);

      // Correct the type of the executing array here as well
      if (executing.push(promise) === concurrencyLimit) {
        await Promise.race(executing);
      }
    }

    // Await all promises in 'results' and then join them into a single string
    const cleanedUpDataParts = await Promise.all(results);
    return cleanedUpDataParts.join(" ");
  }

  async validateCleanedPart(
    original: string,
    cleaned: string
  ): Promise<{ valid: boolean; validationTextResults: string }> {
    this.logger.info(`\nValidating cleaned part:\n${cleaned}\n\n`);
    const validations = await Promise.all([
      this.callLLM(
        "ingestion-agent",
        this.getFirstMessages(
          this.completionValidationSystemMessage,
          this.validationUserMessage(original, cleaned)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
        this.getFirstMessages(
          this.correctnessValidationSystemMessage,
          this.validationUserMessage(original, cleaned)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
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
    this.logger.info(
      `ņ----------------_> completionValidation: ${validationTextResults}\n\n`
    );

    if (
      completionValidation.includes(this.completionValidationSuccessMessage) &&
      correctnessValidation.includes(
        this.correctnessValidationSuccessMessage
      ) &&
      hallucinationValidation.includes(
        this.hallucinationValidationSuccessMessage
      )
    ) {
      return { valid: true, validationTextResults };
    } else {
      return { valid: false, validationTextResults };
    }
  }
}
