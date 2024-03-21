import { IngestionAgentProcessor } from "./agentProcessor.js";
export class RebootingDemocracyIngestionProcessor extends IngestionAgentProcessor {
}
// Asynchronous main function to run the script
async function main() {
    try {
        const processor = new RebootingDemocracyIngestionProcessor();
        await processor.processDataLayout();
        console.log("Data layout processing completed successfully.");
    }
    catch (error) {
        console.error("Failed to process data layout:", error);
    }
}
// Invoke the main function to start the script
main();
