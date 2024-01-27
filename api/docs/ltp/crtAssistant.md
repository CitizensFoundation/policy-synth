# renderFirstUserPromptWithTree

Generates a user prompt including the current reality tree data and user message.

## Parameters

| Name                | Type                                      | Description |
|---------------------|-------------------------------------------|-------------|
| currentUserMessage  | string                                    | The current message from the user. |
| currentRealityTree  | LtpCurrentRealityTreeData                 | The current reality tree data. |
| parentNode          | LtpCurrentRealityTreeDataNode             | The parent node in the current reality tree. |
| currentUDE          | string                                    | The current undesirable effect. |
| parentNodes         | LtpCurrentRealityTreeDataNode[] \| undefined | Optional. The parent nodes in the current reality tree. |

## Return Type

`string`

## Description

This method constructs a user prompt that includes the context of the current reality tree, the undesirable effect (UDE), the direct and intermediate causes of the UDE, and the user's suggestion. It formats this information into a structured prompt for further processing or display.

## Example

```
import { renderFirstUserPromptWithTree } from '@policysynth/api/ltp/crtAssistant.js';

const prompt = renderFirstUserPromptWithTree("User message", currentRealityTreeData, parentNode, "Current UDE", parentNodes);
```

# renderFirstUserPrompt

Generates a prompt for the first user interaction.

## Parameters

| Name              | Type       | Description |
|-------------------|------------|-------------|
| effect            | string     | The effect to be discussed. |
| causes            | string[]   | The causes related to the effect. |
| valdiationReview  | string     | The expert validation review of the causes. |

## Return Type

`string`

## Description

This method creates a structured prompt for the first user interaction, detailing the effect, its causes, and an expert validation review. It is used to initiate the conversation with the user in a structured manner.

## Example

```
import { renderFirstUserPrompt } from '@policysynth/api/ltp/crtAssistant.js';

const prompt = renderFirstUserPrompt("Effect", ["Cause 1", "Cause 2"], "Validation Review");
```

# renderSystemPrompt

Generates a system prompt for guiding the creation of a Current Reality Tree.

## Parameters

None.

## Return Type

`string`

## Description

This method constructs a detailed system prompt that guides the user through the process of creating a Current Reality Tree. It includes instructions on how to interact with the system, offer suggestions, and format responses.

## Example

```
import { renderSystemPrompt } from '@policysynth/api/ltp/crtAssistant.js';

const prompt = renderSystemPrompt();
```

# getRefinedCauses

Asynchronously refines causes based on user input and system analysis.

## Parameters

| Name                  | Type                                        | Description |
|-----------------------|---------------------------------------------|-------------|
| crt                   | LtpCurrentRealityTreeData                   | The current reality tree data. |
| clientId              | string                                      | The client's unique identifier. |
| wsClients             | Map<string, WebSocket>                      | A map of WebSocket clients. |
| parentNode            | LtpCurrentRealityTreeDataNode               | The parent node in the current reality tree. |
| currentUDE            | string                                      | The current undesirable effect. |
| chatLog               | PsSimpleChatLog[]                           | The chat log history. |
| parentNodes           | LtpCurrentRealityTreeDataNode[] \| undefined | Optional. The parent nodes in the current reality tree. |
| customSystemPrompts   | Map<number, string> \| undefined            | Optional. Custom system prompts. |
| effect                | string \| undefined                         | Optional. The effect being discussed. |
| causes                | string[] \| undefined                       | Optional. The causes related to the effect. |
| validationReview      | string \| undefined                         | Optional. The expert validation review of the causes. |

## Return Type

`Promise<void>`

## Description

This asynchronous method refines causes based on user input, system analysis, and the current reality tree data. It utilizes WebSocket to stream responses to the client, guiding them through the process of refining causes and understanding the current reality tree.

## Example

```
import { getRefinedCauses } from '@policysynth/api/ltp/crtAssistant.js';

await getRefinedCauses(crtData, "clientId", wsClients, parentNode, "Current UDE", chatLog, parentNodes, customSystemPrompts, "Effect", ["Cause 1", "Cause 2"], "Validation Review");
```