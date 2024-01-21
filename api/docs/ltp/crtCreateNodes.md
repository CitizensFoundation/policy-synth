# OpenAI

This class provides methods to interact with the OpenAI API.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| DEBUGGING  | boolean| Flag for enabling debugging logs. |

## Methods

| Name                    | Parameters                                             | Return Type | Description                 |
|-------------------------|--------------------------------------------------------|-------------|-----------------------------|
| renderSystemPrompt      | causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a system prompt for the Logical Thinking Process assistant. |
| renderUserPrompt        | currentRealityTree: LtpCurrentRealityTreeData, currentUDE: string, causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a user prompt for the Logical Thinking Process assistant. |
| filterTopCauses         | parsedMessages: CrtPromptJson[]                        | CrtPromptJson[] | Filters and sorts the direct causes based on confidence level. |
| convertToNodes          | topCauses: CrtPromptJson[], nodeType: CrtNodeType, debug: CrtDebugData \| undefined | LtpCurrentRealityTreeDataNode[] | Converts top causes to tree nodes. |
| getParentNodes          | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] | LtpCurrentRealityTreeDataNode[] \| undefined | Retrieves parent nodes for a given node in the tree. |
| identifyCauses          | crt: LtpCurrentRealityTreeData, currentUDE: string, currentparentNode: LtpCurrentRealityTreeDataNode \| undefined | Promise<LtpCurrentRealityTreeDataNode[]> | Identifies causes for a given UDE or node and returns new nodes. |

## Examples

```typescript
// Example usage of the OpenAI class to identify causes
const crtData: LtpCurrentRealityTreeData = {
  // ... some data structure representing the current reality tree
};

const currentUDE = "Decreased customer satisfaction";

const openAI = new OpenAI(config);

openAI.identifyCauses(crtData, currentUDE).then((nodes) => {
  console.log("Identified Nodes:", nodes);
});
```

# hrtime

This is a Node.js process method used to get high-resolution real time.

## Methods

| Name   | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| hrtime | [time: [number, number]] | [number, number] | Gets the current high-resolution real time in a [seconds, nanoseconds] tuple. If the `time` parameter is provided, it returns the current time minus the time provided. |

## Examples

```typescript
// Example usage of hrtime to measure execution time
const startTime = process.hrtime();

// ... some operation ...

const elapsedTime = process.hrtime(startTime);
console.log(`Execution time: ${elapsedTime[0]}s ${elapsedTime[1] / 1000000}ms`);
```

# uuidv4

This function generates a random UUID (Universally Unique Identifier) version 4.

## Methods

| Name   | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| v4     | None       | string      | Generates a random UUID v4. |

## Examples

```typescript
// Example usage of uuidv4 to generate a unique identifier
const uniqueId = uuidv4();
console.log(`Generated UUID: ${uniqueId}`);
```

# LtpCurrentRealityTreeDataNode

This type represents a node in the Logical Thinking Process Current Reality Tree.

## Properties

| Name               | Type                        | Description               |
|--------------------|-----------------------------|---------------------------|
| id                 | string                      | Unique identifier for the node. |
| description        | string                      | Description of the node.  |
| type               | CrtNodeType                 | Type of the node.         |
| isRootCause        | boolean                     | Indicates if the node is a root cause. |
| isLogicValidated   | boolean                     | Indicates if the logic of the node has been validated. |
| children           | LtpCurrentRealityTreeDataNode[] \| undefined | Child nodes of the current node. |
| debug              | CrtDebugData \| undefined   | Debug data associated with the node. |

# CrtPromptJson

This type represents the JSON structure used for prompts in the Logical Thinking Process.

## Properties

| Name                      | Type    | Description               |
|---------------------------|---------|---------------------------|
| directCauseDescription    | string  | Description of the direct cause. |
| isDirectCause             | boolean | Indicates if it is a direct cause. |
| isLikelyARootCauseOfUDE   | boolean | Indicates if it is likely a root cause of the UDE. |
| confidenceLevel           | number  | Confidence level in the cause. |

# CrtNodeType

This type represents the type of node in the Logical Thinking Process Current Reality Tree.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| nodeType   | string | Type of the node, such as "ude" or "directCause". |

# CrtDebugData

This type represents the debug data associated with the Logical Thinking Process.

## Properties

| Name                              | Type   | Description               |
|-----------------------------------|--------|---------------------------|
| systemPromptUsedForGeneration     | string | The system prompt used for generation. |
| firstUserMessageUserForGeneration | string | The first user message used for generation. |