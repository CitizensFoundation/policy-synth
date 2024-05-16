import { PSEngineerAgent } from "./agent.js";
(async () => {
    const githubIssueUrl = process.argv[2]; // Get the GitHub issue URL from the command line arguments
    const agent = new PSEngineerAgent(githubIssueUrl);
    try {
        await agent.run();
        process.exit(0);
    }
    catch (error) {
        console.error("Error running the agent:", error);
        process.exit(1);
    }
})();
//# sourceMappingURL=run.js.map