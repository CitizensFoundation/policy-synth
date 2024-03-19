import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { promises as fs } from "fs";
import { OpenAI } from "openai";
export class StepOneAnalyzer extends PolicySynthAgentBase {
    constructor() {
        super(...arguments);
        this.openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.systemPrompt = `You are an expert deduplication AI agent.
Instructions:
- Deduplicate the list of items provide by the user.
- Depulicate exactly the same items and remove any items that are very similar to each other.
- Do not change anything.
- Only output the unique items nothing else, do not offer any explainations.`;
    }
    async analyze() {
        const data = await fs.readFile("./data/in.json", "utf-8");
        const stageOneData = JSON.parse(data);
        let potentialSources = [];
        let potentialDescriptions = [];
        stageOneData.forEach((data) => {
            potentialSources.push(...(data.potentialSourcesOfInformationAboutBarriersToSkillsFirstPolicies || []));
            potentialDescriptions.push(...(data.potentialDescriptionOfBarriersToSkillsFirstPolicies || []));
        });
        console.log(`Potential sources: ${potentialSources.length}`);
        console.log(`Potential descriptions: ${potentialDescriptions.length}`);
        potentialSources = await this.deduplicate(potentialSources, 3);
        console.log(potentialSources, null, 2);
        potentialDescriptions = await this.deduplicate(potentialDescriptions, 3);
        console.log(potentialDescriptions, null, 2);
        const rows = Math.max(potentialSources.length, potentialDescriptions.length);
        let csvContent = "potentialSources,potentialDescriptions\n";
        for (let i = 0; i < rows; i++) {
            const source = potentialSources[i] || "";
            const description = potentialDescriptions[i] || "";
            csvContent += `"${source}","${description}"\n`;
        }
        // Write to CSV file
        await fs.writeFile("./data/out.csv", csvContent);
    }
    async deduplicate(items, passes = 1) {
        let deduplicatedItems = items;
        console.log(`Deduplicating ${deduplicatedItems.length} items...`);
        for (let i = 0; i < passes; i++) {
            // Randomize array
            deduplicatedItems = this.shuffleArray(deduplicatedItems);
            // Split items into chunks of 20 for processing
            const chunks = this.chunkArray(deduplicatedItems, 20);
            deduplicatedItems = []; // Reset for next pass
            for (let chunk of chunks) {
                const userPrompt = `List of items to deduplicate:\n${chunk.join("\n")}`;
                console.log("User prompt:", userPrompt);
                const response = await this.openaiClient.chat.completions.create({
                    model: "gpt-4-0125-preview",
                    messages: [
                        { role: "system", content: this.systemPrompt },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],
                    max_tokens: 4000,
                    temperature: 0.0,
                });
                const dedupedChunk = response.choices[0]
                    .message.content.split("\n")
                    .filter((line) => line.trim() !== "");
                console.log(JSON.stringify(dedupedChunk, null, 2));
                deduplicatedItems.push(...dedupedChunk);
                console.log(`De-duplicated items length: ${dedupedChunk.length} items`);
            }
            // Further ensure uniqueness after each pass
            deduplicatedItems = [...new Set(deduplicatedItems)];
            console.log(`Pass ${i + 1} completed, ${deduplicatedItems.length} items remaining.`);
        }
        return deduplicatedItems;
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }
    chunkArray(array, chunkSize) {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }
}
(async () => {
    try {
        const analyzer = new StepOneAnalyzer();
        await analyzer.analyze();
        console.log("Analysis completed successfully.");
    }
    catch (error) {
        console.error("An error occurred during analysis:", error);
    }
})();
