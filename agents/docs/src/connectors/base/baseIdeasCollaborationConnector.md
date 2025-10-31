# PsBaseIdeasCollaborationConnector

An abstract base class for implementing connectors to ideas collaboration platforms (such as Your Priorities, All Our Ideas, etc). This class defines the required interface for connectors that enable posting, voting, and interacting with group-based idea collaboration systems. It extends `PsBaseConnector`.

## Properties

This class does not define additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name            | Parameters                                                                                                                                         | Return Type                | Description                                                                                                 |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------|
| **login**       | *(none)*                                                                                                                                          | `Promise<void>`            | Abstract. Authenticates or initializes the connector with the collaboration platform.                        |
| **post**        | `groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string, imageLocalPath: string \| undefined`             | `Promise<YpPostData>`      | Abstract. Posts a new idea to a group, with optional structured answers and image.                           |
| **vote**        | `itemId: number, value: number`                                                                                                                    | `Promise<void>`            | Abstract. Casts a vote (e.g., upvote/downvote) on a post or item.                                            |
| **postPoint**   | `groupId: number, postId: number, userId: number, value: number, content: string`                                                                  | `Promise<YpPointData>`     | Abstract. Posts a point (argument, comment, etc.) to a post within a group.                                  |
| **getGroupPosts** | `groupId: number`                                                                                                                               | `Promise<YpPostData[]>`    | Abstract. Retrieves all posts for a given group.                                                             |
| **generateImage?** | `groupId: number, prompt: string`                                                                                                              | `Promise<number>`          | Optional/async. Generates an image for a group using a prompt. Throws if not supported by the connector.     |

## Example

```typescript
import { PsBaseIdeasCollaborationConnector } from '@policysynth/agents/connectors/base/baseIdeasCollaborationConnector.js';

class MyIdeasConnector extends PsBaseIdeasCollaborationConnector {
  async login(): Promise<void> {
    // Implement authentication logic here
  }

  async post(
    groupId: number,
    name: string,
    structuredAnswersData: YpStructuredAnswer[],
    imagePrompt: string,
    imageLocalPath: string | undefined
  ): Promise<YpPostData> {
    // Implement post creation logic here
    return {} as YpPostData;
  }

  async vote(itemId: number, value: number): Promise<void> {
    // Implement voting logic here
  }

  async postPoint(
    groupId: number,
    postId: number,
    userId: number,
    value: number,
    content: string
  ): Promise<YpPointData> {
    // Implement point posting logic here
    return {} as YpPointData;
  }

  async getGroupPosts(groupId: number): Promise<YpPostData[]> {
    // Implement group posts retrieval logic here
    return [];
  }

  // Optionally override generateImage if supported
  async generateImage(groupId: number, prompt: string): Promise<number> {
    // Implement image generation logic here
    return 123;
  }
}
```

---

**File:** `@policysynth/agents/connectors/base/baseIdeasCollaborationConnector.js`