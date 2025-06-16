import { EcasYayIngestionAgentProcessor } from "./agentProcessor.js";
// Asynchronous main function to run the script
async function main() {
    try {
        const processor = new EcasYayIngestionAgentProcessor();
        await processor.ingest();
        console.log("Data layout processing completed successfully.");
    }
    catch (error) {
        console.error("Failed to process data layout:", error);
    }
}
// Invoke the main function to start the script
main();
//# sourceMappingURL=ingestContent.js.map