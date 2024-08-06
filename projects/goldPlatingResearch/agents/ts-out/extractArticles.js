import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export class ArticleExtractionAgent extends PolicySynthAgent {
    maxExtractionRetries = 3;
    articlesPerBatch = 5;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(text, type) {
        await this.updateRangedProgress(0, `Starting article extraction for ${type}`);
        const extractedArticles = await this.extractArticles(text, type);
        await this.updateRangedProgress(100, `Article extraction completed for ${type}`);
        return extractedArticles;
    }
    async extractArticles(text, type) {
        let allExtractedArticles = [];
        let startArticleNumber = 1;
        let hasMoreArticles = true;
        while (hasMoreArticles) {
            const endArticleNumber = startArticleNumber + this.articlesPerBatch - 1;
            await this.updateRangedProgress((startArticleNumber / 100) * 100, // Assuming there won't be more than 100 articles
            `Extracting articles ${startArticleNumber} to ${endArticleNumber}`);
            const extractedBatch = await this.extractArticleBatch(text, type, startArticleNumber, endArticleNumber);
            if (extractedBatch.length > 0) {
                allExtractedArticles = allExtractedArticles.concat(extractedBatch);
                startArticleNumber = endArticleNumber + 1;
            }
            else {
                hasMoreArticles = false;
            }
        }
        // Validate and deduplicate articles
        const validatedArticles = allExtractedArticles; //TODO: Look into this await this.validateAndDeduplicateArticles(allExtractedArticles);
        return validatedArticles;
    }
    async extractArticleBatch(text, type, startNumber, endNumber) {
        let retryCount = 0;
        let extractedArticles = [];
        while (retryCount < this.maxExtractionRetries) {
            const result = await this.callExtractionModel(text, type, startNumber, endNumber);
            if (this.isValidExtractionResult(result)) {
                extractedArticles = result;
                break;
            }
            retryCount++;
            this.logger.warn(`Extraction failed, retrying (${retryCount}/${this.maxExtractionRetries})`);
        }
        if (retryCount === this.maxExtractionRetries) {
            this.logger.error(`Failed to extract articles ${startNumber}-${endNumber} after ${this.maxExtractionRetries} attempts`);
            return [];
        }
        return extractedArticles;
    }
    async callExtractionModel(text, type, startNumber, endNumber) {
        const messages = [
            this.createSystemMessage(this.getExtractionSystemPrompt(type, startNumber, endNumber)),
            this.createHumanMessage(this.getExtractionUserPrompt(text))
        ];
        return await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, messages, true);
    }
    getExtractionSystemPrompt(type, startNumber, endNumber) {
        return `You are an expert legal document analyzer specializing in extracting articles from ${type}s. Your task is to identify and extract individual articles from the given text.

Instructions:
- Carefully analyze the provided text and identify articles numbered from ${startNumber} to ${endNumber}.
- Extract the article number, full text for each article within this range.
- If an article number in this range is not found, skip it and move to the next number.
- Ensure that the extracted information is accurate and complete.
- Return the extracted articles as a JSON array, where each object represents an article with the following structure:
  {
    "number": "string",
    "text": "string"
  }
- If you cannot extract any articles in this range, return an empty array.
${type === 'law' ? `- Articles always start with "<number>. gr." for example: "7. gr."` : ``}
Remember, accuracy and completeness are crucial. Do not add, remove, or modify any content from the original articles.`;
    }
    getExtractionUserPrompt(text) {
        return `Please extract the specified range of articles from the following text:

${text}

Respond with a JSON array of extracted articles:`;
    }
    isValidExtractionResult(result) {
        if (!Array.isArray(result))
            return false;
        return result.every(article => typeof article === 'object' &&
            typeof article.number === 'string' &&
            typeof article.text === 'string' &&
            typeof article.description === 'string');
    }
    async validateAndDeduplicateArticles(articles) {
        const validatedArticles = [];
        const seenNumbers = new Set();
        for (const article of articles) {
            if (!seenNumbers.has(article.number)) {
                const isValid = await this.validateArticle(article);
                if (isValid) {
                    validatedArticles.push(article);
                    seenNumbers.add(article.number);
                }
                else {
                    this.logger.warn(`Article ${article.number} failed validation, skipping`);
                }
            }
        }
        return validatedArticles;
    }
    async validateArticle(article) {
        const validationMessages = [
            this.createSystemMessage(this.getValidationSystemPrompt()),
            this.createHumanMessage(this.getValidationUserPrompt(article))
        ];
        const validationResult = await this.callModel(PsAiModelType.Text, PsAiModelSize.Small, validationMessages, false);
        return validationResult.toLowerCase().includes('valid');
    }
    getValidationSystemPrompt() {
        return `You are a legal document validation expert. Your task is to verify the validity and integrity of extracted articles.

Instructions:
- Examine the provided article carefully.
- Verify that the article number, text, and description are consistent and make sense together.
- Check for any signs of incorrect extraction, such as incomplete sentences, mismatched content, or irrelevant information.
- If the article appears valid and correctly extracted, respond with "VALID".
- If there are any issues or inconsistencies, respond with "INVALID" followed by a brief explanation.

Your assessment is crucial for maintaining the accuracy of our legal document database.`;
    }
    getValidationUserPrompt(article) {
        return `Please validate the following extracted article:

Article Number: ${article.number}
Article Text: ${article.text}
Description: ${article.description}

Is this article valid?`;
    }
}
//# sourceMappingURL=extractArticles.js.map