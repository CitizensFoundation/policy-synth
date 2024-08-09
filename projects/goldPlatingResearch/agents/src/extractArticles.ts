import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

export class ArticleExtractionAgent extends PolicySynthAgent {
  declare memory: GoldPlatingMemoryData;

  modelSize: PsAiModelSize = PsAiModelSize.Small;

  maxExtractionRetries: number = 3;
  articlesPerBatch: number = 5;

  constructor(
    agent: PsAgent,
    memory: GoldPlatingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
  }

  async processItem(
    text: string,
    type: "law" | "regulation" | "lawSupportArticle"
  ): Promise<LawArticle[] | RegulationArticle[]> {
    await this.updateRangedProgress(
      0,
      `Starting article extraction for ${type}`
    );

    const extractedArticles = await this.extractArticles(text, type);

    await this.updateRangedProgress(
      100,
      `Article extraction completed for ${type}`
    );
    return extractedArticles;
  }

  private async extractArticles(
    text: string,
    type: "law" | "regulation" | "lawSupportArticle"
  ): Promise<LawArticle[] | RegulationArticle[]> {
    let allExtractedArticles: (LawArticle | RegulationArticle)[] = [];
    let startArticleNumber = 1;
    let hasMoreArticles = true;
    let articleCount = 0;
    const MAX_ARTICLES = 39;

    while (hasMoreArticles) {
      const endArticleNumber = startArticleNumber + this.articlesPerBatch - 1;
      await this.updateRangedProgress(
        (startArticleNumber / 100) * 100, // Assuming there won't be more than 100 articles
        `Extracting articles ${startArticleNumber} to ${endArticleNumber}`
      );

      const extractedBatch = await this.extractArticleBatch(
        text,
        type,
        startArticleNumber,
        endArticleNumber
      );

      articleCount += extractedBatch.length;

      if (articleCount >= MAX_ARTICLES) {
        hasMoreArticles = false;
        this.logger.warn("Reached maximum number of articles");
      } else {
        if (extractedBatch.length > 0) {
          allExtractedArticles = allExtractedArticles.concat(extractedBatch);
          startArticleNumber = endArticleNumber + 1;
        } else {
          hasMoreArticles = false;
        }
      }
    }

    // Validate and deduplicate articles
    const validatedArticles = allExtractedArticles; //TODO: Look into this await this.validateAndDeduplicateArticles(allExtractedArticles);

    return validatedArticles;
  }

  private async extractArticleBatch(
    text: string,
    type: "law" | "regulation" | "lawSupportArticle",
    startNumber: number,
    endNumber: number
  ): Promise<(LawArticle | RegulationArticle)[]> {
    let retryCount = 0;
    let extractedArticles: (LawArticle | RegulationArticle)[] = [];

    while (retryCount < this.maxExtractionRetries) {
      const result = await this.callExtractionModel(
        text,
        type,
        startNumber,
        endNumber
      );

      if (this.isValidExtractionResult(result)) {
        extractedArticles = result;
        break;
      } else {
        this.logger.warn(
          `Extraction result is invalid: ${JSON.stringify(result, null, 2)}`
        );
      }

      retryCount++;
      this.logger.warn(
        `Extraction failed, retrying (${retryCount}/${this.maxExtractionRetries})`
      );
    }

    if (retryCount === this.maxExtractionRetries) {
      this.logger.error(
        `Failed to extract articles ${startNumber}-${endNumber} after ${this.maxExtractionRetries} attempts`
      );
      return [];
    }

    return extractedArticles;
  }

  private async callExtractionModel(
    text: string,
    type: "law" | "regulation" | "lawSupportArticle",
    startNumber: number,
    endNumber: number
  ): Promise<any> {
    const messages = [
      this.createSystemMessage(
        this.getExtractionSystemPrompt(type, startNumber, endNumber)
      ),
      this.createHumanMessage(this.getExtractionUserPrompt(text)),
    ];

    return (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      messages,
      true
    )) as any;
  }

  private getExtractionSystemPrompt(
    type: "law" | "regulation" | "lawSupportArticle",
    startNumber: number,
    endNumber: number
  ): string {
    return `You are an expert legal document analyzer specializing in extracting articles from ${type}s. Your task is to identify and extract individual articles from the given text.

Instructions:
- Carefully analyze the provided text and identify articles numbered from ${startNumber} to ${endNumber}.
- Extract the article number, full text for each article within this range.
- If no articles are found in this range output an empty JSON array and nothing else, it means we have reached the end of the articles.
- Ensure that the extracted information is accurate and complete.
- Return the extracted articles as a JSON array, where each object represents an article with the following structure:
  {
    "number": "string", ${
      type === "law" ? "// Article number, e.g. '7. gr.' and only that format never extract 'mgr.' as an article" : ""
    }
    "text": "string"
  }
- Only output JSON, nothing else, no explainations or introductions.
- If you cannot extract any articles in this range, return an empty array never output articles not found in the document.
${
  type === "lawSupportArticle"
    ? `- 1) in the second half of your context find where it says: "greinargerð" 2) After that exctract only articles in the format "Um <number>. gr."  f.e. "Um 1. gr."`
    : ``
}
${
  type === "law"
    ? `- Law articles always start with "<number>. gr." for example: "7. gr." at the start of a line.\n\n- Never extract articles that just have a <number>. <title> they always have to have "gr." as an identifier`
    : ``
}
Remember, accuracy and completeness are crucial. Do not add, remove, or modify any content from the original articles.`;
  }

  private getExtractionUserPrompt(text: string): string {
    return `Please extract the specified range of articles from the following text:

${text}

Respond with a JSON array of extracted articles:`;
  }

  private isValidExtractionResult(
    result: any
  ): result is (LawArticle | RegulationArticle)[] {
    if (!Array.isArray(result)) return false;

    return result.every(
      (article) =>
        typeof article === "object" &&
        typeof article.number === "string" &&
        typeof article.text === "string"
    );
  }

  private async validateAndDeduplicateArticles(
    articles: (LawArticle | RegulationArticle)[]
  ): Promise<(LawArticle | RegulationArticle)[]> {
    const validatedArticles: (LawArticle | RegulationArticle)[] = [];
    const seenNumbers = new Set<string>();

    for (const article of articles) {
      if (!seenNumbers.has(article.number)) {
        const isValid = await this.validateArticle(article);
        if (isValid) {
          validatedArticles.push(article);
          seenNumbers.add(article.number);
        } else {
          this.logger.warn(
            `Article ${article.number} failed validation, skipping`
          );
        }
      }
    }

    return validatedArticles;
  }

  private async validateArticle(
    article: LawArticle | RegulationArticle
  ): Promise<boolean> {
    const validationMessages = [
      this.createSystemMessage(this.getValidationSystemPrompt()),
      this.createHumanMessage(this.getValidationUserPrompt(article)),
    ];

    const validationResult = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Small,
      validationMessages,
      false
    )) as string;

    return validationResult.toLowerCase().includes("valid");
  }

  private getValidationSystemPrompt(): string {
    return `You are a legal document validation expert. Your task is to verify the validity and integrity of extracted articles.

Instructions:
- Examine the provided article carefully.
- Verify that the article number, text, and description are consistent and make sense together.
- Check for any signs of incorrect extraction, such as incomplete sentences, mismatched content, or irrelevant information.
- If the article appears valid and correctly extracted, respond with "VALID".
- If there are any issues or inconsistencies, respond with "INVALID" followed by a brief explanation.

Your assessment is crucial for maintaining the accuracy of our legal document database.`;
  }

  private getValidationUserPrompt(
    article: LawArticle | RegulationArticle
  ): string {
    return `Please validate the following extracted article:

Article Number: ${article.number}
Article Text: ${article.text}

Is this article valid?`;
  }
}
