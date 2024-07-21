# PsBaseCollaborationConnector

The `PsBaseCollaborationConnector` is an abstract class that extends the `PsBaseConnector`. It defines the structure and common utility methods for collaboration connectors. Collaboration connectors are expected to implement methods for logging in, posting content, and voting on items. Additionally, an optional method for image generation can be implemented if supported by the collaboration platform.

## Properties

This class does not define any properties.

## Methods

| Name             | Parameters                                                                 | Return Type     | Description                                                                 |
|------------------|----------------------------------------------------------------------------|-----------------|-----------------------------------------------------------------------------|
| `login`          | -                                                                          | `Promise<void>` | Abstract method that must be implemented to handle the login process.       |
| `post`           | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string` | `Promise<YpPostData>` | Abstract method that must be implemented to handle posting content.         |
| `vote`           | `itemId: number, value: number`                                            | `Promise<void>` | Abstract method that must be implemented to handle voting on items.         |
| `generateImage?` | `groupId: number, prompt: string`                                          | `Promise<number>` | Optional method for image generation, throws error if not supported.        |
| `retryOperation` | `operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000` | `Promise<T>`    | Utility method to retry an operation a specified number of times with delay.|

### `login`

```typescript
abstract login(): Promise<void>;
```

Abstract method that must be implemented by subclasses to handle the login process.

### `post`

```typescript
abstract post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData>;
```

Abstract method that must be implemented by subclasses to handle posting content.

### `vote`

```typescript
abstract vote(itemId: number, value: number): Promise<void>;
```

Abstract method that must be implemented by subclasses to handle voting on items.

### `generateImage?`

```typescript
async generateImage?(groupId: number, prompt: string): Promise<number> {
  throw new Error("Image generation not supported by this collaboration connector.");
}
```

Optional method for image generation. If not supported by the collaboration platform, it throws an error.

### `retryOperation`

```typescript
protected async retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
}
```

Utility method to retry an operation a specified number of times with a delay between attempts. If the operation fails after the maximum number of retries, it throws an error.

## Example

```typescript
import { PsBaseCollaborationConnector } from '@policysynth/agents/connectors/base/baseCollaborationConnector.js';

class MyCollaborationConnector extends PsBaseCollaborationConnector {
  async login(): Promise<void> {
    // Implement login logic here
  }

  async post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData> {
    // Implement post logic here
  }

  async vote(itemId: number, value: number): Promise<void> {
    // Implement vote logic here
  }

  async generateImage(groupId: number, prompt: string): Promise<number> {
    // Implement image generation logic here
  }
}
```

In this example, `MyCollaborationConnector` extends `PsBaseCollaborationConnector` and implements the required abstract methods (`login`, `post`, and `vote`). The optional `generateImage` method is also implemented.