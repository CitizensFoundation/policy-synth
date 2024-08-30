import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
import { IcelandicLawXmlAgent } from "./icelandicLaw.js";
import { JSDOM } from 'jsdom';
import fetch from "node-fetch";
export class ArticleExtractionAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    maxModelTokensOut = 15192;
    modelTemperature = 0.0;
    maxExtractionRetries = 3;
    maxValidationRetries = 3;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(text, type, lastArticleNumber, xmlUrl, lawArticleUrl) {
        await this.updateRangedProgress(0, `Starting article extraction for ${type}`);
        try {
            let validatedArticles;
            if (type == "law" && xmlUrl && xmlUrl.endsWith(".xml")) {
                const icelandicLawXmlAgent = new IcelandicLawXmlAgent(this.agent, this.memory, 0, 20);
                validatedArticles = await icelandicLawXmlAgent.processItem(xmlUrl);
            }
            else if (type == "lawSupportArticle") {
                validatedArticles = await this.extractLawSupportArticles(lawArticleUrl);
            }
            else {
                this.logger.debug(`lastLawArticleNumber ${lastArticleNumber}`);
                if (!lastArticleNumber) {
                    lastArticleNumber = await this.getLastArticleNumber(text, type);
                }
                const extractedArticles = await this.extractArticles(text, type, lastArticleNumber);
                /*const validatedArticles = await this.validateExtractedArticles(
                  text,
                  extractedArticles,
                  type
                );*/
                validatedArticles = extractedArticles;
            }
            await this.updateRangedProgress(100, `Article extraction completed for ${type}`);
            return validatedArticles || [];
        }
        catch (error) {
            this.logger.error(`Error during article extraction: ${error}`);
            throw error;
        }
    }
    async getLastArticleNumber(text, type) {
        let lookForText;
        if (type == "law") {
            lookForText = "N. gr.";
        }
        else if (type == "regulation") {
            lookForText = "N.";
        }
        else if (type == "lawSupportArticle") {
            lookForText = "Um N. gr.";
        }
        else {
            throw new Error(`Invalid type: ${type}`);
        }
        const systemPrompt = `Analyze the following ${type} text and identify the number of the last article. Look for the last instance of article number in this format ${lookForText}.
    Return a JSON markdown object with the format:
    \`\`\`json
    {
      "lastArticleNumber": <number>
    }
    \`\`\`

    Only output the JSON object without any other explanations.`;
        const userPrompt = `${type} to analyize for last article number, your JSON markdown format output:\n${text}`;
        const result = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, [
            this.createSystemMessage(systemPrompt),
            this.createHumanMessage(userPrompt),
        ], true));
        if (typeof result.lastArticleNumber !== "number" ||
            result.lastArticleNumber <= 0) {
            throw new Error(`Invalid last article number: ${result.lastArticleNumber}`);
        }
        this.logger.debug(`Last article number: ${result.lastArticleNumber}`);
        return result.lastArticleNumber;
    }
    getArticleTextNumber(type, articleNumber) {
        if (type === "law") {
            return `${articleNumber}. gr.`;
        }
        else if (type === "regulation") {
            return `${articleNumber}.`;
        }
        else if (type === "lawSupportArticle") {
            return `Um ${articleNumber}. gr.`;
        }
        else {
            throw new Error(`Invalid type: ${type}`);
        }
    }
    async extractLawSupportArticles(url) {
        try {
            this.logger.info(`----> Fetching law support articles from ${url}`);
            // Fetch the HTML content from the URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.logger.debug(`Fetched HTML from ${url} First 100 chars: ${html.slice(0, 100)}`);
            const articles = [];
            const articleRegex = /-->Um (\d+)\. gr\.([\s\S]*?)(?=-->Um \d+\. gr\.|-->Um ákvæði|$)/g;
            let match;
            while ((match = articleRegex.exec(html)) !== null) {
                const articleNumber = parseInt(match[1]);
                const articleHtmlContent = match[2].trim();
                // Extract text content from the HTML snippet
                const dom = new JSDOM(articleHtmlContent);
                const textContent = dom.window.document.body.textContent || "";
                this.logger.debug(`\n\n\nExtracted article ${articleNumber} from HTML content:\n${articleHtmlContent}\n\n${textContent}`);
                articles.push({
                    number: articleNumber,
                    text: textContent.trim(),
                    description: ""
                });
            }
            return articles;
        }
        catch (error) {
            this.logger.error(`Error fetching or parsing HTML from ${url}: ${error}`);
            throw error;
        }
    }
    async extractArticles(text, type, lastArticleNumber) {
        const articles = [];
        for (let i = 1; i <= lastArticleNumber; i++) {
            let articleNumberText = this.getArticleTextNumber(type, i);
            let nextArticleNumberText;
            if (i < lastArticleNumber) {
                nextArticleNumberText = this.getArticleTextNumber(type, i + 1);
            }
            this.logger.debug(`Extracting article ${i} of ${lastArticleNumber} (${articleNumberText})`);
            const article = await this.extractSingleArticle(text, type, i, articleNumberText, nextArticleNumberText);
            if (article) {
                articles.push(article);
                this.logger.debug(`Extracted article ${i}:\n${JSON.stringify(article, null, 2)}`);
            }
            else {
                this.logger.error(`Failed to extract article ${i}`);
            }
            await this.updateRangedProgress((i / lastArticleNumber) * 50, // Use only 50% of the progress for extraction
            `Extracting article ${i} of ${lastArticleNumber}`);
        }
        return articles;
    }
    async extractSingleArticle(text, type, articleNumber, articleNumberText, nextArticleNumberText) {
        let retryCount = 0;
        while (retryCount < this.maxExtractionRetries) {
            try {
                this.logger.debug(`Extracting ${type} article ${articleNumberText}`);
                const articleText = await this.callExtractionModel(text, type, articleNumberText, nextArticleNumberText);
                this.logger.debug(`Extracted article ${articleNumberText}:\n${articleText}`);
                const result = {
                    number: articleNumber,
                    text: articleText,
                };
                if (this.isValidExtractionResult(result)) {
                    return result;
                }
            }
            catch (error) {
                this.logger.warn(`Error extracting article ${articleNumber}: ${error}`);
            }
            retryCount++;
            this.logger.warn(`Extraction failed for article ${articleNumber}, retrying (${retryCount}/${this.maxExtractionRetries})`);
        }
        this.logger.error(`Failed to extract article ${articleNumber} after ${this.maxExtractionRetries} attempts`);
        return null;
    }
    async callExtractionModel(text, type, articleNumber, nextArticleNumberText) {
        const systemPrompt = `<LawExtractionSystemPrompt>Extract the an article from the ${type} text.
    The user will provide you with the article number in the <articleNumberToExtract> field, only extract that article exactly as it appears in the ${type} text.

    <${type}TextToExtractFrom>${text}</${type}TextToExtractFrom>

    Output the one extracted article exactly as it appears in the <${type}TextToExtractFrom> text, word for word without any expainations before or after.
    ${type == "lawSupportArticle"
            ? `The support text articles start after the main law articles in ths provided text, so only look for the <articleNumberToExtract> after the word 'Greinargerð' appears in the document`
            : ""}
    </LawExtractionSystemPrompt>`;
        const userPrompt = `<articleNumberToExtract>${articleNumber}</articleNumberToExtract>

    ${nextArticleNumberText
            ? `<extractUntilThisNextArticleStart>${nextArticleNumberText}</extractUntilThisNextArticleStart>`
            : ""}

    Your fully extracted ${type} article in text format:
    `;
        return (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, [
            this.createSystemMessage(systemPrompt),
            this.createHumanMessage(userPrompt),
        ], false));
    }
    isValidExtractionResult(result) {
        return (typeof result === "object" &&
            typeof result.number === "number" &&
            typeof result.text === "string" &&
            result.text.trim().length > 0);
    }
}
//# sourceMappingURL=extractArticles.js.map