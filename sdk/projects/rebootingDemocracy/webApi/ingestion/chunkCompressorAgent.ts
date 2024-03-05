import { BaseIngestionAgent } from "./baseAgent.js";
import { IEngineConstants } from "./constants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class IngestionChunkCompressorAgent extends BaseIngestionAgent {
  maxCompressionRetries = 25;
  retryCountBeforeRandomizingLlmTemperature = 15;

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
- The compressed text of course has less detail and that is fine.
- If there is no additional text in the compressed text, then output, and nothing else: No additional content in compressed text.
`);

  correctnessValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything that is incorrect in the compressed text compared to the uncompressed text and list it out.
- The compressed text of course has less detail and that is fine
- If all the compressed text is correct, output: All content correct in compressed text.
`);

  completionValidationSystemMessage =
    new SystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify every that is not in the compressed text but are in the uncompressed text.
- The compressed text of course has less words but should still have all the contents.
- If all the content is in the compressed text then output, and nothing else: All content present in compressed text.
`);

  validationUserMessage = (uncompressed: string, compressed: string) =>
    new HumanMessage(`<UNCOMPRESSED_TEXT>${uncompressed}</UNCOMPRESSED_TEXT>

<COMPRESSED_TEXT>${compressed}</COMPRESSED_TEXT>

Think step by step and output your analysis here:
`);

  compressionSystemMessage =
    new SystemMessage(`You are an expert text compressor.

Instructions:
- You will compress each paragraph in the text marked <ORIGINAL_TEXT_TO_COMPRESS> into as many paragraphs as there are in the original text.
- Compress each paragraph into as few words as you can without losing any meaning, nuance or detail.
- Pay special attention to all detail, meaning and nuance in the original text and make sure it is in your compressed text.
- Output the compressed text, nothing else.
`);

  compressionUserMessage = (data: string) =>
    new HumanMessage(`<ORIGINAL_TEXT_TO_COMPRESS>
${data}
</ORIGINAL_TEXT_TO_COMPRESS>

Your compressed text:
`);

  compressionRetryUserMessage = (
    data: string,
    lastCompressed: string,
    validationTextResults: string
  ) =>
    new HumanMessage(`<ORIGINAL_TEXT_TO_COMPRESS>
${data}
</ORIGINAL_TEXT_TO_COMPRESS>

IMPORTANT: You have already tried once to compress this text, and you got those validation suggestions:
<SUGGESTIONS_FOR_COMPRESSION_IMPROVEMENTS>
${validationTextResults}
</SUGGESTIONS_FOR_COMPRESSION_IMPROVEMENTS>

<LAST_COMPRESSION_ATTEMPT_TO_IMPROVE_ON>
${lastCompressed}
</LAST_COMPRESSION_ATTEMPT_TO_IMPROVE_ON>

Please use the information from the last compression validation suggestions to improve on the last compression attempt.

Your new improved compressed text:
`);

  async compress(uncompressedData: string): Promise<string> {
    this.resetLlmTemperature();

    let compressedText;

    let validated = false;
    let validationTextResults: string | undefined;
    let lastCompressedData: string | undefined;

    let retryCount = 0;
    while (!validated && retryCount < this.maxCompressionRetries) {
      try {
        if (validationTextResults && lastCompressedData) {
          console.log(`\n\nRetrying compression ${retryCount}\n\n`)
          console.log(
            this.compressionRetryUserMessage(
              uncompressedData,
              lastCompressedData,
              validationTextResults
            ).content
          );
        }
        compressedText = (await this.callLLM(
          "ingestion-agent",
          IEngineConstants.ingestionModel,
          this.getFirstMessages(
            this.compressionSystemMessage,
            validationTextResults && lastCompressedData
              ? this.compressionRetryUserMessage(
                  uncompressedData,
                  lastCompressedData,
                  validationTextResults
                )
              : this.compressionUserMessage(uncompressedData)
          ),
          false
        )) as string;

        const validationResults = await this.validateChunkSummary(
          uncompressedData,
          compressedText
        );

        lastCompressedData = compressedText;

        console.log(`\nCompressed text:\n${lastCompressedData}\n\n`);

        validated = validationResults.valid;

        retryCount++;

        if (!validated) {
          validationTextResults = validationResults.validationTextResults;
          console.warn(
            `\nCompression Validation failed ${retryCount}\n${validationTextResults}\n\n`
          );
        }

        if (retryCount > this.retryCountBeforeRandomizingLlmTemperature) {
          this.randomizeLlmTemperature();
        }
      } catch (error) {
        retryCount++;
        console.warn(`Compression failed ${retryCount}: ${error}`);
      }
    }

    if (validated && compressedText) {
      return compressedText;
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
        !correctnessValidation.includes(
          this.correctnessValidationSuccessMessage
        )
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
