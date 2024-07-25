# PolicySynthAgentQueue

The `PolicySynthAgentQueue` class is an abstract class that extends the `PolicySynthAgent` class. It is designed to manage the lifecycle and processing of agents using a queue system backed by Redis and BullMQ.

## Properties

| Name                  | Type             | Description                                                                 |
|-----------------------|------------------|-----------------------------------------------------------------------------|
| status                | PsAgentStatus    | The current status of the agent.                                            |
| skipCheckForProgress  | boolean          | Flag to skip checking for progress.                                         |
| startProgress         | number           | The starting progress value.                                                |
| endProgress           | number           | The ending progress value.                                                  |
| redis                 | ioredis.Redis    | Redis client instance for managing agent status and memory.                 |
| agentQueueName        | string           | Abstract property to be defined in subclasses, representing the queue name. |

## Methods

| Name                       | Parameters                                                                 | Return Type          | Description                                                                                       |
|----------------------------|----------------------------------------------------------------------------|----------------------|---------------------------------------------------------------------------------------------------|
| constructor                | -                                                                          | -                    | Initializes the agent with default progress values.                                               |
| loadAgentStatusFromRedis   | -                                                                          | Promise<PsAgentStatus> | Loads the agent status from Redis.                                                                |
| saveAgentStatusToRedis     | -                                                                          | Promise<void>        | Saves the agent status to Redis.                                                                  |
| setupStatusIfNeeded        | -                                                                          | Promise<void>        | Sets up the agent status if it is not already initialized.                                        |
| processAllAgents           | -                                                                          | Promise<void>        | Processes all agents in the queue.                                                                |
| setupMemoryIfNeeded        | -                                                                          | Promise<void>        | Abstract method to be implemented in subclasses for setting up memory if needed.                  |
| setupAgentQueue            | -                                                                          | Promise<void>        | Sets up the agent queue and worker for processing jobs.                                           |
| startAgent                 | -                                                                          | Promise<void>        | Starts the agent and processes all agents.                                                        |
| stopAgent                  | -                                                                          | Promise<void>        | Stops the agent.                                                                                  |
| pauseAgent                 | -                                                                          | Promise<void>        | Pauses the agent.                                                                                 |
| updateAgentStatus          | state: "running" \| "stopped" \| "paused"                                  | Promise<void>        | Updates the agent status and saves it to Redis.                                                   |
| processors                 | -                                                                          | Array<{ processor: new (agent: PsAgent, memory: any, startProgress: number, endProgress: number) => PolicySynthAgent; weight: number; }> | Abstract property to be defined in subclasses, representing the processors and their weights.     |

## Example

```typescript
import { PolicySynthAgentQueue } from '@policysynth/agents/base/agentQueue.js';

class MyAgentQueue extends PolicySynthAgentQueue {
  get agentQueueName() {
    return 'my-agent-queue';
  }

  get processors() {
    return [
      {
        processor: MyProcessor,
        weight: 50,
      },
      {
        processor: AnotherProcessor,
        weight: 50,
      },
    ];
  }

  async setupMemoryIfNeeded() {
    // Custom memory setup logic
  }
}

const myAgentQueue = new MyAgentQueue();
myAgentQueue.setupAgentQueue();
```

In this example, `MyAgentQueue` extends `PolicySynthAgentQueue` and provides implementations for the abstract properties and methods. The `agentQueueName` is set to `'my-agent-queue'`, and two processors are defined with equal weights. The `setupMemoryIfNeeded` method contains custom logic for setting up memory if needed. Finally, an instance of `MyAgentQueue` is created and the agent queue is set up.