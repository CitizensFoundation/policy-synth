import { PSEngineerAgent } from "./agent.js";

(async () => {
  const agent = new PSEngineerAgent();
  try {
    await agent.run();
    process.exit(0);
  } catch (error) {
    console.error("Error running the agent:", error);
    process.exit(1);
  }
})();
