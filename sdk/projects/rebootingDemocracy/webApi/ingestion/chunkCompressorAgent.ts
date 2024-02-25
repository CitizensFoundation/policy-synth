import { BaseIngestionAgent } from "./baseAgent.js";
import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class IngestionChunkCompressorAgent extends BaseIngestionAgent {
  maxCompressionRetries = 15;

  completionValidationSuccessMessage =
    "All content present in compressed text.";

  correctnessValidationSuccessMessage =
    "All content correct in compressed text.";

  hallucinationValidationSuccessMessage =
    "No additional content in compressed text.";

  hallucinationValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything in the compressed text that is not in the uncompressed text.
- The compressed text should not include anything not in the uncompressed text
- The compressed text of course has less detail and that is fine
- If there is no additional text in the compressed text, then output, and nothing else: No additional content in compressed text.
`);

  correctnessValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify
-- concepts
-- ideas
-- names
-- places
... that are incorrect in the compressed text.
- The compressed text of course has less detail and that is fine
- If all the compressed text is correct, output: All content correct in compressed text.
`);

  completionValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify
-- concepts
-- ideas
-- names
-- places
... that are not at all in the compressed text but are in the uncompressed text.
- The compressed text of course has less detail but should still have all the contents.
- If all the content is in the compressed text then output, and nothing else: All content present in compressed text.
`);

  validationUserMessage = (uncompressed: string, compressed: string) =>
    new HumanMessage(`<UNCOMPRESSED_TEXT>${uncompressed}</UNCOMPRESSED_TEXT>

<COMPRESSED_TEXT>${compressed}</COMPRESSED_TEXT>

Think step by step and output your analysis here:
`);

  compressionSystemMessage =
    new SystemMessage(`You are an expert text analyzer and compressor.

Instructions:
- You will analyze the text for metadata
- You will compress the text to a title, shortDescription and all content compressed
- For the fullCompressedContents make it as short as possible but do not leave anything out, keep all names, places and events.

Output:
- Output your analysis and compressed text in this JSON format: {
  title: string;
  shortDescription: string;
  fullCompressedContents: string;
  textMetaData: { [key: string]: string };
}`);

  compressionUserMessage = (
    data: string,
    retryCount: number,
    validationTextResults: string | undefined
  ) =>
    new HumanMessage(`${
      validationTextResults
        ? `Note: You have already tried once to compress this text, and you got those validation errors:\n${validationTextResults}\n\n`
        : ``
    }Document to analyze and compress:
${
  retryCount > 1
    ? "MAKE SURE TO INCLUDE ALL THE CONTENT AND DETAILS FROM THE ORIGINAL CONTENT"
    : ""
}${data}
`);

  async compress(
    uncompressedData: string
  ): Promise<LlmChunkCompressionReponse> {
    this.resetLlmTemperature();

    let chunkCompression;

    let validated = false;
    let validationTextResults: string | undefined;

    let retryCount = 0;
    while (!validated && retryCount < this.maxCompressionRetries) {
      chunkCompression = (await this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.compressionSystemMessage,
          this.compressionUserMessage(
            uncompressedData,
            retryCount,
            validationTextResults
          )
        )
      )) as LlmChunkCompressionReponse;

      const validationResults = await this.validateChunkSummary(
        uncompressedData,
        chunkCompression.fullCompressedContents
      );

      validated = validationResults.valid;

      retryCount++;

      if (!validated) {
        validationTextResults = validationResults.validationTextResults;
        console.warn(`\nCompression Validation failed ${retryCount}\n${validationTextResults}\n\n`);
      }

      if (retryCount > 2) {
        this.randomizeLlmTemperature();
      }
    }

    if (validated && chunkCompression) {
      return chunkCompression;
    } else {
      throw new Error("Chunk summary validation failed");
    }
  }

  async validateChunkSummary(
    uncompressed: string,
    compressed: string
  ): Promise<{ valid: boolean; validationTextResults: string }> {
    const validations = await Promise.all([
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.completionValidationSystemMessage,
          this.validationUserMessage(uncompressed, compressed)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.correctnessValidationSystemMessage,
          this.validationUserMessage(uncompressed, compressed)
        ),
        false
      ),
      this.callLLM(
        "ingestion-agent",
        IEngineConstants.ingestionModel,
        this.getFirstMessages(
          this.hallucinationValidationSystemMessage,
          this.validationUserMessage(uncompressed, compressed)
        ),
        false
      ),
    ]);

    const [
      completionValidation,
      correctnessValidation,
      hallucinationValidation,
    ] = validations.map((response) => response as string);

    const validationTextResults = `${completionValidation}\n${correctnessValidation}\n${hallucinationValidation}\n\n`;

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
      if (
        !completionValidation.includes(this.completionValidationSuccessMessage)
      ) {
        console.warn(
          `Chunk summary completionValidation failed: ${completionValidation}`
        );
      }
      if (
        !correctnessValidation.includes(this.correctnessValidationSuccessMessage)
      ) {
        console.warn(
          `Chunk summary correctnessValidation failed: ${correctnessValidation}`
        );
      }
      if (
       !hallucinationValidation.includes(
          this.hallucinationValidationSuccessMessage
        )
      ) {
        console.warn(
          `Chunk summary hallucinationValidation failed: ${hallucinationValidation}`
        );
      }
      return { valid: false, validationTextResults };
    }
  }
}
