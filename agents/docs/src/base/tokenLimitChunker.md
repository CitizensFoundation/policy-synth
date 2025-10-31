# TokenLimitChunker

A helper class for handling large prompt inputs that may exceed the context window of AI models. It automatically chunks and summarizes large documents, retrying with smaller pieces when token limits are exceeded. Designed for robust, provider-agnostic chunking and summarization, with special handling for OpenAI and Gemini models.

**File:** `@policysynth/agents/base/tokenLimitChunker.js`

---

## Properties

| Name      | Type         | Description                                                                                 |
|-----------|--------------|---------------------------------------------------------------------------------------------|
| manager   | ModelCaller  | An instance responsible for calling the underlying AI model.                                |

---

## Static Properties

| Name         | Type         | Description                                                                                 |
|--------------|--------------|---------------------------------------------------------------------------------------------|
| geminiAi     | GoogleGenAI  | Static instance of the Gemini AI client, used for token counting with Gemini models.        |

---

## Constants

| Name                      | Type    | Value         | Description                                                                                 |
|---------------------------|---------|---------------|---------------------------------------------------------------------------------------------|
| MIN_CONTEXT_TOKENS        | number  | 120_000       | Absolute minimum context window across all deployed models.                                  |
| DEFAULT_MAX_CONTEXT_TOKENS| number  | 1_000_000     | Fallback "typical" context window size when not otherwise known.                             |

---

## Methods

| Name                        | Parameters                                                                                                                                                                                                 | Return Type         | Description                                                                                                   |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------|
| constructor                 | manager: ModelCaller                                                                                                                                                | TokenLimitChunker   | Constructs a new TokenLimitChunker with a given model manager.                                                |
| geminiTokenCount (static)   | modelName: string, prompt: string                                                                                                                                    | Promise<number>     | Uses Gemini API to count tokens in a prompt for a given model.                                                |
| countTokens                 | model: BaseChatModel, text: string                                                                                                                                   | Promise<number>     | Counts tokens in a string for a given model, using Gemini or tiktoken as appropriate.                         |
| isTokenLimitError (static)  | err: unknown                                                                                                                                                        | boolean             | Determines if an error is due to exceeding the model's token/context limit.                                   |
| parseTokenLimit (static)    | err: any                                                                                                                                                            | number \| undefined | Extracts the context window size from a provider error message, if possible.                                  |
| calcTokenLimitFromModel     | model: BaseChatModel                                                                                                                                                 | number              | Calculates the usable token limit for a model, accounting for output tokens.                                  |
| chunkByTokensGemini         | model: BaseChatModel, text: string, allowedTokens: number                                                                                                           | Promise<string[]>   | Chunks text for Gemini models, using a calibrated tokens-per-character estimate and paragraph packing.         |
| chunkByTokens               | model: BaseChatModel, text: string, allowedTokens: number                                                                                                           | Promise<string[]>   | Chunks text for OpenAI (tiktoken) or Gemini models, delegating as appropriate.                                |
| handle                      | model: BaseChatModel, modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options: PsCallModelOptions, err: any                         | Promise<any>        | Main entry point: chunks, analyzes, and summarizes a large prompt, retrying as needed for token limits.       |

---

## Example

```typescript
import { TokenLimitChunker } from '@policysynth/agents/base/tokenLimitChunker.js';
import { BaseChatModel } from '@policysynth/agents/aiModels/baseChatModel.js';

// Example ModelCaller implementation
const modelCaller = {
  async callModel(type, size, messages, options) {
    // ...call your AI model here...
    return "Model response";
  }
};

const chunker = new TokenLimitChunker(modelCaller);

const model = new BaseChatModel({
  modelName: "gpt-4o",
  config: {
    maxContextTokens: 128000,
    maxTokensOut: 4000,
    // ...other config...
  }
});

const messages = [
  { role: "system", message: "Summarize the following document." },
  { role: "user", message: "Very long document text..." }
];

const options = {
  xmlTagToPreserveForTooManyTokenSplitting: "section",
  numberOfLastWordsToPreserveForTooManyTokenSplitting: 50,
  maximumNumberOfSplitDocumentChunks: 10
};

chunker.handle(
  model,
  "openai",
  "xl",
  messages,
  options,
  null
).then(result => {
  console.log("Final summarization:", result);
}).catch(err => {
  console.error("Chunking failed:", err);
});
```

---

## Method Details

### constructor(manager: ModelCaller)
Creates a new TokenLimitChunker instance.

### static geminiTokenCount(modelName: string, prompt: string): Promise<number>
Counts tokens in a prompt using Gemini's API.

### countTokens(model: BaseChatModel, text: string): Promise<number>
Counts tokens for a given model and text, using Gemini or tiktoken as appropriate.

### static isTokenLimitError(err: unknown): boolean
Returns true if the error is due to exceeding the model's context window.

### static parseTokenLimit(err: any): number | undefined
Attempts to extract the context window size from an error message.

### calcTokenLimitFromModel(model: BaseChatModel): number
Calculates the usable token limit for a model, subtracting output tokens.

### chunkByTokensGemini(model: BaseChatModel, text: string, allowedTokens: number): Promise<string[]>
Chunks text for Gemini models, using paragraph packing and a safety margin.

### chunkByTokens(model: BaseChatModel, text: string, allowedTokens: number): Promise<string[]>
Chunks text for OpenAI (tiktoken) or Gemini models, delegating as appropriate.

### handle(
  model: BaseChatModel,
  modelType: PsAiModelType,
  modelSize: PsAiModelSize,
  messages: PsModelMessage[],
  options: PsCallModelOptions,
  err: any
): Promise<any>
Main entry point: chunks, analyzes, and summarizes a large prompt, retrying as needed for token limits.

---

## Usage Notes

- Handles both OpenAI (tiktoken) and Gemini models for token counting and chunking.
- Automatically detects and handles token/context limit errors, retrying with smaller chunks.
- Preserves important XML tags and trailing context if specified in options.
- Throws errors if the document cannot be chunked within the allowed number of chunks or if the prefix/context is too large.
- Designed for use in robust, production-grade AI agent pipelines.

---