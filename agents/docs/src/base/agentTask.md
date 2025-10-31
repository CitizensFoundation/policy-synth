# PolicySynthAgentTask

An abstract base class for implementing agent tasks in the PolicySynth framework. This class manages the lifecycle of an agent task, including planning, tool invocation, observation, and completion. It provides a structured directory layout for task runs, scratch files, memory, artifacts, and logs, and offers utility methods for file operations. The class is designed to be extended by concrete agent task implementations.

## Properties

| Name                | Type                                                                 | Description                                                                                  |
|---------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| TOOLS               | `ToolSpec[]`                                                         | List of available tool specifications (OpenAI function tools) for the agent.                 |
| messages            | `PsModelMessage[]`                                                   | Array of messages exchanged during the agent's run (system, user, assistant, tool, etc.).    |
| pendingToolCalls    | `ToolCall[]`                                                         | List of tool calls that are pending execution.                                               |
| phase               | `AgentPhase`                                                         | Current phase of the agent's execution lifecycle.                                            |
| runDir              | `string`                                                             | Root directory for the current agent task run.                                               |
| dirs                | `{ scratch: string; memory: string; artifacts: string; logs: string }`| Subdirectories for scratch files, memory, artifacts, and logs.                               |
| modelCallOptions    | `PsCallModelOptions`                                                 | Options for model calls (e.g., reasoning effort, temperature, etc.).                         |
| fs                  | `{ ... }`                                                            | Utility object for file operations (mktemp, writeText, readText, writeJSON, readJSON, list). |

## Constructor

```typescript
constructor(agent: PsAgent, memory: PsAgentMemoryData, taskId: string)
```

- **agent**: `PsAgent`  
  The agent instance for this task.
- **memory**: `PsAgentMemoryData`  
  The memory object for the agent.
- **taskId**: `string`  
  Unique identifier for this task run.

Initializes the agent task, sets up directory structure, and configures reasoning effort.

## Methods

| Name                | Parameters                                                                                      | Return Type                                 | Description                                                                                      |
|---------------------|------------------------------------------------------------------------------------------------|---------------------------------------------|--------------------------------------------------------------------------------------------------|
| setReasoningEffort  | `effort: "low" \| "medium" \| "high"`                                                          | `void`                                      | Sets the reasoning effort for the model and updates the model manager if present.                |
| run                 | `userMessage: string, systemPrompt: string`                                                    | `AsyncIterableIterator<PsModelMessage>`      | Main execution loop for the agent task. Yields messages as the agent progresses through phases.  |
| policy (abstract)   | none                                                                                           | `readonly string[]`                         | Abstract method. Should return the list of allowed tool names for the agent.                     |
| planningStart       | none                                                                                           | `Promise<void>`                             | Hook called at the start of the planning phase. Logs "Planning started".                        |
| planningEnd         | none                                                                                           | `Promise<void>`                             | Hook called at the end of the planning phase. Logs "Planning ended".                            |
| isDone              | none                                                                                           | `boolean`                                   | Returns true if the agent has finished (last message is from assistant and not a tool call).     |
| planStep            | none                                                                                           | `Promise<void>`                             | Executes a planning/model call step, possibly scheduling tool calls or moving to observation.    |
| callToolStep        | none                                                                                           | `Promise<void>`                             | Executes all pending tool calls in parallel, records results, and advances phase.                |
| runTool             | `name: string, args: Record<string, unknown>`                                                  | `Promise<string>`                           | Default tool runner: stores arguments as an artifact and returns a message with the file path.   |
| fs.mktemp           | `bucket: keyof PolicySynthAgentTask["dirs"], prefix?: string, ext?: string`                    | `string`                                    | Creates a temporary file path in the specified bucket.                                           |
| fs.writeText        | `bucket: keyof PolicySynthAgentTask["dirs"], rel: string, data: string`                        | `Promise<string>`                           | Writes text data to a file in the specified bucket.                                              |
| fs.readText         | `bucket: keyof PolicySynthAgentTask["dirs"], rel: string`                                      | `Promise<string>`                           | Reads text data from a file in the specified bucket.                                             |
| fs.writeJSON        | `bucket: keyof PolicySynthAgentTask["dirs"], rel: string, obj: unknown, pretty?: number`       | `Promise<string>`                           | Writes JSON data to a file in the specified bucket.                                              |
| fs.readJSON         | `bucket: keyof PolicySynthAgentTask["dirs"], rel: string`                                      | `Promise<any>`                              | Reads and parses JSON data from a file in the specified bucket.                                  |
| fs.list             | `bucket: keyof PolicySynthAgentTask["dirs"], rel?: string`                                     | `Promise<Dirent[]>`                         | Lists files in a directory within the specified bucket.                                          |

## Enums

### AgentPhase

Represents the current phase of the agent's execution.

```typescript
enum AgentPhase {
  START,
  PLAN,
  CALL_TOOL,
  OBSERVE,
  FINISH,
}
```

## Types

### ToolSpec

Alias for OpenAI's function tool specification.

```typescript
type ToolSpec = ChatCompletionFunctionTool;
```

## Example

```typescript
import { PolicySynthAgentTask, AgentPhase } from '@policysynth/agents/base/agentTask.js';
import { PsAgent } from '@policysynth/agents/dbModels/agent.js';

// Example subclass implementing a custom policy and tool
class MyAgentTask extends PolicySynthAgentTask {
  protected policy(): readonly string[] {
    // Only allow the "search" tool
    return ["search"];
  }

  // Optionally override runTool to implement custom tool logic
  protected async runTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === "search") {
      // ... perform search ...
      return "search results";
    }
    return super.runTool(name, args);
  }
}

// Usage
const agent = /* ... PsAgent instance ... */;
const memory = /* ... PsAgentMemoryData ... */;
const taskId = "unique-task-id";

const myTask = new MyAgentTask(agent, memory, taskId);

(async () => {
  for await (const msg of myTask.run("What is the capital of France?", "You are a helpful assistant.")) {
    console.log(msg);
  }
})();
```

---

**File:** `@policysynth/agents/base/agentTask.js`  
This class is intended to be extended for implementing custom agent tasks with tool usage, planning, and file management.