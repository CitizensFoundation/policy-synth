# runValidationChain

This function orchestrates the validation chain for evaluating logical statements, including effects and causes, using various validation agents.

## Properties

| Name                  | Type                                                                 | Description               |
|-----------------------|----------------------------------------------------------------------|---------------------------|
| crt                   | LtpCurrentRealityTreeData                                            | The current reality tree data. |
| clientId              | string                                                               | The client identifier. |
| wsClients             | Map<string, WebSocket>                                               | A map of WebSocket clients. |
| parentNode            | LtpCurrentRealityTreeDataNode                                        | The parent node in the current reality tree. |
| currentUDE            | string                                                               | The current undesirable effect. |
| chatLog               | PsSimpleChatLog[]                                                    | The chat log. |
| parentNodes           | LtpCurrentRealityTreeDataNode[] \| undefined                        | The parent nodes in the current reality tree. |
| effect                | string                                                               | The effect to be validated. |
| causes                | string[]                                                             | The causes to be validated. |
| validationReview      | string                                                               | The validation review. |
| customSystemPrompts   | Map<number, string> \| undefined                                     | Custom system prompts for validation. |

## Methods

| Name                | Parameters                                                                 | Return Type | Description                                                                 |
|---------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderUserMessage   | effect: string, causes: string[], valdiationReview: string                 | string      | Renders the user message for validation.                                    |
| runValidationChain  | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, chatLog: PsSimpleChatLog[], parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined, effect: string, causes: string[], validationReview: string, customSystemPrompts: Map<number, string> \| undefined | void        | Orchestrates the validation chain for evaluating logical statements. |

## Examples

```
import { runValidationChain } from '@policysynth/api/ltp/crtValidationChain.js';

// Example usage of runValidationChain
const crtData = { /* LtpCurrentRealityTreeData structure */ };
const clientId = 'exampleClientId';
const wsClients = new Map();
const parentNode = { /* LtpCurrentRealityTreeDataNode structure */ };
const currentUDE = 'exampleUDE';
const chatLog = [ /* Array of PsSimpleChatLog */ ];
const parentNodes = [ /* Array of LtpCurrentRealityTreeDataNode */ ];
const effect = 'exampleEffect';
const causes = ['cause1', 'cause2'];
const validationReview = 'exampleValidationReview';
const customSystemPrompts = new Map([[1, 'Custom system prompt for validation 1']]);

runValidationChain(crtData, clientId, wsClients, parentNode, currentUDE, chatLog, parentNodes, effect, causes, validationReview, customSystemPrompts);
```