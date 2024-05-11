import { PSEngineerAgent } from "./agent.js";

(async () => {
  const agent = new PSEngineerAgent();
  try {
    await agent.run();
  } catch (error) {
    console.error("Error running the agent:", error);
  }
})();
