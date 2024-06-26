import { BaseIngestionAgent } from "./baseAgent.js";
export class IngestionChunkCompressorAgent extends BaseIngestionAgent {
    maxCompressionRetries = 15;
    retryCountBeforeRandomizingLlmTemperature = 13;
    completionValidationSuccessMessage = "All content present in compressed text.";
    correctnessValidationSuccessMessage = "All content correct in compressed text.";
    hallucinationValidationSuccessMessage = "No additional content in compressed text.";
    hallucinationValidationSystemMessage = this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything in the compressed text that is not in the uncompressed text.
- The compressed text should not include anything not in the uncompressed text
- The compressed text of course has less detail and that is fine.
- If there is no additional text in the compressed text, then output, and nothing else: No additional content in compressed text.
`);
    correctnessValidationSystemMessage = this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything important that is incorrect in the compressed text compared to the uncompressed text and give exact instructions on how to improve the compressed text as short clear unnumbered sentences.

- The compressed text of course has less detail and that is fine.

- Slightly different wording is fine as well as long as detail is captured.

- Simplifying is fine as well as long as basic nuance is captured.

- This is a compressed text so don't comment on minor details missing.

- If all the compressed text is correct, output: All content correct in compressed text.
`);
    completionValidationSystemMessage = this.createSystemMessage(`You are an detailed oriented text comparison agent.

Instructions:
- Identify anything that is not at all in the compressed text but is in the uncompressed text and give exact instructions on how to improve the compressed text, item by item.
- The compressed text of course has less words but should still have all the contents.
- If all the content is in the compressed text then output, and nothing else: All content present in compressed text.
`);
    validationUserMessage = (uncompressed, compressed) => this.createHumanMessage(`<UNCOMPRESSED_TEXT>${uncompressed}</UNCOMPRESSED_TEXT>

<COMPRESSED_TEXT>${compressed}</COMPRESSED_TEXT>

Think step by step and output your analysis here:
`);
    compressionSystemMessage = this.createSystemMessage(`You are an expert text compressor.

Instructions:
- You will compress each paragraph in the text marked <ORIGINAL_TEXT_TO_COMPRESS> into as many paragraphs as there are in the original text.
- Compress each paragraph into as few words as you can without losing any details, nuance or meaning.
- Pay special attention to all concepts, meaning, detail and nuance in the original text and make sure it is in your compressed text.
- You should only compress the text so it has fewer words otherwise all detail, meaning and nuance should be the same.
- Output the compressed text, nothing else.
`);
    compressionRetrySystemMessage = this.createSystemMessage(`You are an expert text compressor.

Instructions:
- You will compress each paragraph in the text marked <ORIGINAL_TEXT_TO_COMPRESS> into as many paragraphs as there are in the original text.
- Compress each paragraph into as few words as you can without losing any meaning, nuance or detail.
- Pay special attention to all detail, meaning and nuance in the original text and make sure it is in your compressed text.
- IMPORTANT: This is your second attempt to compress this text, pay special attention to: CURRENT_SUGGESTIONS_IMPROVEMENTS and implement each of those suggestions in your new compressed text.
- Output the compressed text, nothing else.
`);
    compressionUserMessage = (data) => this.createHumanMessage(`<ORIGINAL_TEXT_TO_COMPRESS>
${data}
</ORIGINAL_TEXT_TO_COMPRESS>

Your compressed text:
`);
    compressionRetryUserMessage = (data, lastCompressed, currentValidationResults, previousValidationResults, retryCount) => this.createHumanMessage(`<ORIGINAL_TEXT_TO_COMPRESS>
${data}
</ORIGINAL_TEXT_TO_COMPRESS>

IMPORTANT: You have already tried ${retryCount} times to compress this text, and you got those new suggestions for improvement:
<CURRENT_SUGGESTIONS_FOR_IMPROVEMENTS>
${currentValidationResults}
</CURRENT_SUGGESTIONS_FOR_IMPROVEMENTS>

${previousValidationResults && previousValidationResults.trim() != ""
        ? `
<PREVIOUS_SUGGESTIONS_FOR_IMPROVEMENTS>
${previousValidationResults}
</PREVIOUS_SUGGESTIONS_FOR_IMPROVEMENTS>
`
        : ``}

<LAST_COMPRESSION_ATTEMPT_TO_IMPROVE_ON>
${lastCompressed}
</LAST_COMPRESSION_ATTEMPT_TO_IMPROVE_ON>

Please use the suggestions for improvement to improve on the last compression attempt.

Your new improved compressed text:
`);
    async compress(uncompressedData) {
        let compressedText;
        let validated = false;
        let lastCompressedData;
        let retryCount = 0;
        let previousValidationResults = "";
        let currentValidationResults = "";
        while (!validated && retryCount < this.maxCompressionRetries) {
            try {
                if (currentValidationResults && lastCompressedData) {
                    console.log(`\n\nRetrying compression ${retryCount}\n\n`);
                    console.log(this.compressionRetryUserMessage(uncompressedData, lastCompressedData, currentValidationResults, previousValidationResults, retryCount).message);
                }
                compressedText = (await this.callLLM("ingestion-agent", this.getFirstMessages(currentValidationResults && lastCompressedData
                    ? this.compressionRetrySystemMessage
                    : this.compressionSystemMessage, currentValidationResults && lastCompressedData
                    ? this.compressionRetryUserMessage(uncompressedData, lastCompressedData, currentValidationResults, previousValidationResults, retryCount)
                    : this.compressionUserMessage(uncompressedData)), false));
                if (currentValidationResults) {
                    previousValidationResults += currentValidationResults;
                    const previousValidationResultsLines = previousValidationResults.split("\n");
                    if (previousValidationResultsLines.length > 12) {
                        previousValidationResults = previousValidationResultsLines
                            .slice(previousValidationResultsLines.length - 12)
                            .join("\n");
                    }
                }
                const validationResults = await this.validateChunkSummary(uncompressedData, compressedText);
                lastCompressedData = compressedText;
                console.log(`\nCompressed text:\n${lastCompressedData}\n\n`);
                validated = validationResults.valid;
                retryCount++;
                if (!validated) {
                    currentValidationResults = validationResults.validationTextResults;
                    console.warn(`\nCompression Validation failed ${retryCount}:\n\n${currentValidationResults}\n\n`);
                }
            }
            catch (error) {
                retryCount++;
                console.warn(`Compression failed ${retryCount}: ${error}`);
            }
        }
        if (validated && compressedText) {
            return compressedText;
        }
        else {
            console.error("Chunk summary validation failed");
            return uncompressedData;
        }
    }
    async validateChunkSummary(uncompressed, compressed) {
        const validations = await Promise.all([
            /*this.callLLM(
              "ingestion-agent",
              PsIngestionConstants.ingestionMainModel,
              this.getFirstMessages(
                this.completionValidationSystemMessage,
                this.validationUserMessage(uncompressed, compressed)
              ),
              false
            ),*/
            this.callLLM("ingestion-agent", this.getFirstMessages(this.correctnessValidationSystemMessage, this.validationUserMessage(uncompressed, compressed)), false),
            this.callLLM("ingestion-agent", this.getFirstMessages(this.hallucinationValidationSystemMessage, this.validationUserMessage(uncompressed, compressed)), false),
        ]);
        const [
        // completionValidation,
        correctnessValidation, hallucinationValidation,] = validations.map((response) => response);
        //const validationOkTextResults = `${completionValidation}\n${correctnessValidation}\n${hallucinationValidation}\n\n`;
        const validationOkTextResults = `${correctnessValidation}\n${hallucinationValidation}\n\n`;
        let currentValidationResults = "";
        if (
        // completionValidation.includes(this.completionValidationSuccessMessage) &&
        correctnessValidation.includes(this.correctnessValidationSuccessMessage) &&
            hallucinationValidation.includes(this.hallucinationValidationSuccessMessage)) {
            return { valid: true, validationTextResults: validationOkTextResults };
        }
        else {
            /*if (
              !completionValidation.includes(this.completionValidationSuccessMessage)
            ) {
              previousValidationResults += `${completionValidation}\n`;
              console.warn(
                `Chunk summary completionValidation failed: ${completionValidation}`
              );
            }*/
            if (!correctnessValidation.includes(this.correctnessValidationSuccessMessage)) {
                currentValidationResults += `${correctnessValidation}\n`;
                console.warn(`Chunk summary correctnessValidation failed: ${correctnessValidation}`);
            }
            if (!hallucinationValidation.includes(this.hallucinationValidationSuccessMessage)) {
                currentValidationResults += `${hallucinationValidation}\n`;
                console.warn(`Chunk summary hallucinationValidation failed: ${hallucinationValidation}`);
            }
            return {
                valid: false,
                validationTextResults: currentValidationResults,
            };
        }
    }
}
//# sourceMappingURL=chunkCompressorAgent.js.map