# OpenAI

This class provides methods to interact with the OpenAI API.

## Properties

No properties are documented for this class.

## Methods

| Name                     | Parameters                                      | Return Type | Description                                                                 |
|--------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderUserPrompt         | crt: LtpCurrentRealityTreeData                  | string      | Generates a user prompt string based on the provided Current Reality Tree data. |
| renderSystemPrompt       | None                                            | string      | Generates a system prompt string for reviewing a Current Reality Tree.      |
| getConfigurationReview   | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket> | Promise<void> | Initiates a review of the Current Reality Tree configuration and streams the response to the WebSocket client. |

## Examples

```typescript
// Example usage of the OpenAI class methods

// Assuming LtpCurrentRealityTreeData is already defined and instantiated as `crtData`
const clientId = "some-unique-client-id";
const wsClients = new Map<string, WebSocket>();

// Example usage of renderUserPrompt
const userPrompt = renderUserPrompt(crtData);
console.log(userPrompt);

// Example usage of renderSystemPrompt
const systemPrompt = renderSystemPrompt();
console.log(systemPrompt);

// Example usage of getConfigurationReview
await getConfigurationReview(crtData, clientId, wsClients);
```

# LtpCurrentRealityTreeData

This type represents the data structure for the Current Reality Tree in the Logical Thinking Process.

## Properties

| Name               | Type     | Description                                       |
|--------------------|----------|---------------------------------------------------|
| context            | string   | The context or background for the Current Reality Tree. |
| undesirableEffects | string[] | A list of undesirable effects identified in the Current Reality Tree. |

## Examples

```typescript
// Example usage of LtpCurrentRealityTreeData

const crtData: LtpCurrentRealityTreeData = {
  context: "The context of the problem or situation.",
  undesirableEffects: ["Undesirable effect 1", "Undesirable effect 2"]
};
```

Please note that the actual implementation of the `LtpCurrentRealityTreeData` type and its usage in the `renderUserPrompt` and `getConfigurationReview` methods are not shown in the provided code snippet. The example assumes that such a type is defined elsewhere in the codebase.