import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { promises as fs } from "fs";
import { OpenAI } from "openai";
import { StageOneRanker } from "./stageOneRanker.js";

export class StepOneAnalyzer extends PolicySynthScAgentBase {
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
  const sourceUrlMap = new Map<string, StageOneData>();
  const descriptionUrlMap = new Map<string, StageOneData>();

  stageOneData.forEach((data) => {
    data.potentialSourcesOfInformationAboutBarriersToSkillsFirstPolicies?.forEach((source) => {
      potentialSources.push(source);
      sourceUrlMap.set(source, data);
    });
    data.potentialDescriptionOfBarriersToSkillsFirstPolicies?.forEach((description) => {
      potentialDescriptions.push(description);
      descriptionUrlMap.set(description, data);
    });
  });

  //potentialSources = potentialSources.slice(0,40);
  //potentialDescriptions = potentialDescriptions.slice(0,40);

  console.log(`Potential sources: ${potentialSources.length}`);
  console.log(`Potential descriptions: ${potentialDescriptions.length}`);

  // Deduplicate case-insensitively while preserving the original capitalization
  let uniqueSourcesMap = new Map(potentialSources.map((item) => [item.toLowerCase(), item]));
  let uniqueDescriptionsMap = new Map(potentialDescriptions.map((item) => [item.toLowerCase(), item]));

  // Sort maps alphabetically by key and retain original case for values
  let uniqueSources = Array.from(uniqueSourcesMap.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  let uniqueDescriptions = Array.from(uniqueDescriptionsMap.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  console.log(`Unique potential sources: ${uniqueSources.length}`);
  console.log(`Unique potential descriptions: ${uniqueDescriptions.length}`);

  // Deduplication process; assuming this function is correctly implemented to preserve the order
  uniqueSources = await this.deduplicate(uniqueSources, 1);
  uniqueDescriptions = await this.deduplicate(uniqueDescriptions, 1);

  console.log(uniqueSources);
  console.log(uniqueDescriptions);

  const ranker = new StageOneRanker();
  ranker.rankInstructions =
    "Rank the potential sources of information about barriers to Skills First policies.\
   Those barriers are specifically around needing university degrees where skills would be enough.\
   Where laws and regululation puts in place barriers to implementing Skills First policies if different government departments want to.";
  await ranker.rankItems(uniqueSources);
  const rankedSources = ranker.getOrderedListOfItems(-1) as string[];

  ranker.rankInstructions =
    "Rank the potential descriptions of barriers to Skills First policies.\
   Those barriers are specifically around needing university degrees where skills would be enough.\
   Where laws and regululation puts in place barriers to implementing Skills First policies if different government departments want to.";
  await ranker.rankItems(uniqueDescriptions);
  const rankedDescriptions = ranker.getOrderedListOfItems(-1) as string[];

  // Preparing CSV content
  let csvContentSources =
    "potentialSources,summary,howThisIsRelevant,relevanceScore,url\n";
  for (const source of rankedSources) {
    const data = sourceUrlMap.get(source)!;
    if (data) {
      csvContentSources += `"${source}",${data.summary}","${data.howThisIsRelevant}","${data.relevanceScore}","${data.url}"\n`;
    } else {
      console.error(`Data not found for source: ${source}`);
    }
  }

  // Write to CSV file
  await fs.writeFile("./data/out_sources.csv", csvContentSources);

  let csvContentDescriptions =
    "potentialDescriptions,summary,howThisIsRelevant,relevanceScore,url\n";
  for (const description of rankedDescriptions) {
    const data = descriptionUrlMap.get(description)!;
    if (data) {
      csvContentDescriptions += `"${description}","${data.summary}","${data.howThisIsRelevant}","${data.relevanceScore}","${data.url}"\n`;
    } else {
      console.error(`Data not found for description: ${description}`);
    }
  }

  // Write to CSV file
  await fs.writeFile("./data/out_descriptions.csv", csvContentDescriptions);
}

async deduplicate(items: string[], passes: number = 1): Promise<string[]> {
  let deduplicatedItems = items;
  console.log(`Deduplicating ${deduplicatedItems.length} items...`);

  for (let i = 0; i < passes; i++) {
    // Randomize array
    if (i > 0) deduplicatedItems = this.shuffleArray(deduplicatedItems);

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
    console.log(`Pass ${i + 1} completed, ${deduplicatedItems.length} items remaining.`);
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
