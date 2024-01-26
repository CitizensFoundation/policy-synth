# AgentProblems

AgentProblems is a class that extends the BaseProcessingAgent class and is responsible for processing various stages of problem-solving tasks. It maintains a memory state and processes tasks based on the current stage of the problem-solving process.

## Properties

| Name    | Type                             | Description                                   |
|---------|----------------------------------|-----------------------------------------------|
| memory  | IEngineInnovationMemoryData      | The memory state of the agent.                |

## Methods

| Name                | Parameters        | Return Type | Description                                                                 |
|---------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| initializeMemory    | job: Job          | Promise<void> | Initializes the memory state with the job data.                            |
| setStage            | stage: IEngineStageTypes | Promise<void> | Sets the current stage in the memory and updates the start time.           |
| processSubProblems  | -                 | Promise<void> | Processes the sub-problems using the CreateSubProblemsProcessor.           |
| process             | -                 | Promise<void> | Processes the current stage of the problem-solving task.                    |

## Examples

```typescript
// Example usage of the AgentProblems class
const agent = new Worker(
  "agent-problems",
  async (job: Job) => {
    console.log(`Agent Problems Processing job ${job.id}`);
    const agent = new AgentProblems();
    await agent.setup(job);
    await agent.process();
    return job.data;
  },
  { concurrency: parseInt(process.env.AGENT_INNOVATION_CONCURRENCY || "1") }
);

process.on("SIGINT", async () => {
  await agent.close();
});
```