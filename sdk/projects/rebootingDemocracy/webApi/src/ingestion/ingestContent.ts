import { RebootingDemocracyIngestionProcessor } from "./agentProcessor.js";

export class RebootingDemocracyIngestionProcessorWorker extends RebootingDemocracyIngestionProcessor {
    // Your class implementation here.
    // If you need specific functionality for RebootingDemocracyIngestionProcessor, add it here.
}

// Asynchronous main function to run the script
async function main() {
    try {
        const processor = new RebootingDemocracyIngestionProcessor();
        await processor.processDataLayout();
        console.log("Data layout processing completed successfully.");
process.exit(0);
    } catch (error) {
        console.error("Failed to process data layout:", error);
    }
}

// Invoke the main function to start the script
main();
