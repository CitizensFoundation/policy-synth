# OpenAI

This class provides methods to interact with the OpenAI API.

## Properties

| Name       | Type   | Description               |
|------------|--------|---------------------------|
| DEBUGGING  | boolean| Flag for debugging mode.  |

## Methods

| Name                   | Parameters                                             | Return Type | Description                 |
|------------------------|--------------------------------------------------------|-------------|-----------------------------|
| renderSystemPrompt     | causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a system prompt for the chat completion. |
| renderUserPrompt       | currentRealityTree: LtpCurrentRealityTreeData, currentUDE: string, causeToExmine: LtpCurrentRealityTreeDataNode \| undefined, parentNodes: LtpCurrentRealityTreeDataNode[] \| undefined | string      | Generates a user prompt for the chat completion. |
| filterTopCauses        | parsedMessages: CrtPromptJson[]                        | CrtPromptJson[] | Filters and sorts the causes by confidence level, returning the top 3. |
| convertToNodes         | topCauses: CrtPromptJson[], nodeType: CrtNodeType, debug: CrtDebugData \| undefined | LtpCurrentRealityTreeDataNode[] | Converts top causes to tree nodes. |
| getParentNodes         | nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes: LtpCurrentRealityTreeDataNode[] | LtpCurrentRealityTreeDataNode[] \| undefined | Recursively finds and returns the parent nodes of a given node. |
| identifyCauses         | crt: LtpCurrentRealityTreeData, currentUDE: string, currentparentNode: LtpCurrentRealityTreeDataNode \| undefined | Promise<LtpCurrentRealityTreeDataNode[]> | Identifies causes based on the current reality tree data and returns them as nodes. |

## Examples

```typescript
// Example usage of the OpenAI class to identify causes
const crtData: LtpCurrentRealityTreeData = {
  // ... your current reality tree data here
};
const currentUDE = "Undesirable Effect Example";
const currentparentNode: LtpCurrentRealityTreeDataNode | undefined = undefined;

const openAI = new OpenAI(config);
openAI.identifyCauses(crtData, currentUDE, currentparentNode)
  .then(nodes => {
    console.log(nodes);
  })
  .catch(error => {
    console.error(error);
  });
```

# hrtime

This is a Node.js process method used to get high-resolution real time.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| hrtime     | time?: [number, number] | [number, number] | Gets the high-resolution real time. |

## Examples

```typescript
// Example usage of hrtime to measure execution time
const startTime = process.hrtime();
// ... some operation
const endTime = process.hrtime(startTime);
console.log(`Execution time: ${endTime[0]}s ${endTime[1] / 1000000}ms`);
```

# uuidv4

This function generates a random UUID (Universally Unique Identifier) according to RFC4122 standards.

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| uuidv4     | None              | string      | Generates a random UUID.    |

## Examples

```typescript
// Example usage of uuidv4 to generate a unique identifier
const uniqueId = uuidv4();
console.log(uniqueId);
```