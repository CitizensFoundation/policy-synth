import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { promises as fs } from "fs";
import { OpenAI } from "openai";

export class StepOneAnalyzer extends PolicySynthAgentBase {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  systemPrompt = `You are an expert deduplication AI agent.
Instructions:
- Deduplicate the list of items provide by the user.
- Depulicate exactly the same items and remove any items that are very similar to each other.
- Do not change anything.
- Only output the unique items nothing else, do not offer any explainations.`;

  async analyze() {
    const data = await fs.readFile("./data/in.json", "utf-8");
    const stageOneData: StageOneData[] = JSON.parse(data);

    let potentialSources: string[] = [];
    let potentialDescriptions: string[] = [];

    stageOneData.forEach((data) => {
      potentialSources.push(
        ...(data.potentialSourcesOfInformationAboutBarriersToSkillsFirstPolicies ||
          [])
      );
      potentialDescriptions.push(
        ...(data.potentialDescriptionOfBarriersToSkillsFirstPolicies || [])
      );
    });

    potentialSources.slice(100);
    potentialDescriptions.slice(100);

    // Deduplicate case-insensitively while preserving the original capitalization
    let uniqueSourcesMap = new Map(
      potentialSources.map((item) => [item.toLowerCase(), item])
    );
    let uniqueDescriptionsMap = new Map(
      potentialDescriptions.map((item) => [item.toLowerCase(), item])
    );

    // Sort maps alphabetically by key and retain original case for values
    let uniqueSources = Array.from(uniqueSourcesMap.values()).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    let uniqueDescriptions = Array.from(uniqueDescriptionsMap.values()).sort(
      (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
    );

    console.log(`Unique potential sources: ${uniqueSources.length}`);
    console.log(`Unique potential descriptions: ${uniqueDescriptions.length}`);

    // Deduplication process; assuming this function is correctly implemented to preserve the order
    uniqueSources = await this.deduplicate(uniqueSources, 3);
    uniqueDescriptions = await this.deduplicate(uniqueDescriptions, 3);

    console.log(uniqueSources);
    console.log(uniqueDescriptions);

    StageOneRanker ranker = new StageOneRanker();
    ranker.rankInstructions = "Rank the potential sources of information about barriers to Skills First policies.\
     Those barriers are specifically around needing university degrees where skills would be enough.\
     Where laws and regululation puts in place barriers to implementing Skills First policies if different government departments want to.";
    await ranker.rankItems(uniqueSources);
    const rankedSources = ranker.getOrderedListOfItems(-1) as string[];

    ranker.rankInstructions = "Rank the potential descriptions of barriers to Skills First policies.\
     Those barriers are specifically around needing university degrees where skills would be enough.\
     Where laws and regululation puts in place barriers to implementing Skills First policies if different government departments want to.";

    await ranker.rankItems(uniqueDescriptions);
    const rankedDescriptions = ranker.getOrderedListOfItems(-1) as string[];

    // Preparing CSV content
    const rows = Math.max(uniqueSources.length, uniqueDescriptions.length);
    let csvContent = "potentialSources,potentialDescriptions\n";

    for (let i = 0; i < rows; i++) {
      const source = rankedSources[i] || "";
      const description = rankedDescriptions[i] || "";
      csvContent += `"${source}","${description}"\n`;
    }

    // Write to CSV file
    await fs.writeFile("./data/out.csv", csvContent);
  }

  async deduplicate(items: string[], passes: number = 1): Promise<string[]> {
    let deduplicatedItems = items;

    console.log(`Deduplicating ${deduplicatedItems.length} items...`);

    for (let i = 0; i < passes; i++) {
      // Randomize array
      if (i > 0)
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
          .message!.content!.split("\n")
          .filter((line) => line.trim() !== "");

        console.log(JSON.stringify(dedupedChunk, null, 2));

        deduplicatedItems.push(...dedupedChunk);

        console.log(`De-duplicated items length: ${dedupedChunk.length} items`);
      }

      // Further ensure uniqueness after each pass
      deduplicatedItems = [...new Set(deduplicatedItems)];

      console.log(
        `Pass ${i + 1} completed, ${deduplicatedItems.length} items remaining.`
      );
    }

    return deduplicatedItems;
  }

  shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  chunkArray(array: string[], chunkSize: number): string[][] {
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
  } catch (error) {
    console.error("An error occurred during analysis:", error);
  }
})();
