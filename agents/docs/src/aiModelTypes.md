# PsAiModelType, PsAiModelSize, PsAiModelProvider

This file defines key enumerations for describing AI model types, sizes, and providers within the PolicySynth Agents framework. These enums are used throughout the system to specify and restrict the kinds of AI models that can be configured, selected, or referenced in agent and connector configurations.

---

## PsAiModelType

Describes the functional type of an AI model. This is used to indicate what kind of data the model processes or generates.

| Name                 | Value                  | Description                                                                 |
|----------------------|------------------------|-----------------------------------------------------------------------------|
| Embedding            | "embedding"            | Model for generating vector embeddings from text or other data.              |
| Text                 | "text"                 | Model for generating or processing text.                                     |
| MultiModal           | "multiModal"           | Model that can process/generate multiple data types (e.g., text + image).    |
| Audio                | "audio"                | Model for processing or generating audio data.                               |
| Video                | "video"                | Model for processing or generating video data.                               |
| Image                | "image"                | Model for processing or generating images.                                   |
| TextReasoning        | "reasoning"            | Model specialized in text-based reasoning tasks.                             |
| MultiModalReasoning  | "multiModalReasoning"  | Model specialized in reasoning across multiple modalities.                   |

---

## PsAiModelSize

Describes the relative size or capacity of an AI model. This is typically used to select between different performance/cost tradeoffs.

| Name   | Value    | Description                        |
|--------|----------|------------------------------------|
| Large  | "large"  | Large model (highest capacity).    |
| Medium | "medium" | Medium-sized model.                |
| Small  | "small"  | Small model (lowest capacity).     |

---

## PsAiModelProvider

Enumerates the supported providers for AI models. Used to specify which external service or platform supplies the model.

| Name            | Value            | Description                                               |
|-----------------|------------------|-----------------------------------------------------------|
| OpenAI          | "openai"         | OpenAI API (e.g., GPT-3, GPT-4, DALL·E, etc.).            |
| OpenAIResponses | "openaiResponses"| OpenAI with custom response handling.                     |
| Anthropic       | "anthropic"      | Anthropic API (e.g., Claude models).                      |
| Google          | "google"         | Google AI APIs (e.g., PaLM, Gemini, etc.).                |
| Azure           | "azure"          | Microsoft Azure OpenAI Service.                           |

---

## Example

```typescript
import { PsAiModelType, PsAiModelSize, PsAiModelProvider } from '@policysynth/agents/aiModelTypes.js';

// Example: Defining a model configuration
const myModelConfig = {
  modelType: PsAiModelType.Text,
  modelSize: PsAiModelSize.Large,
  provider: PsAiModelProvider.OpenAI,
  modelName: "gpt-4-turbo"
};
```

These enums help ensure type safety and clarity when working with AI model configurations in the PolicySynth Agents system.