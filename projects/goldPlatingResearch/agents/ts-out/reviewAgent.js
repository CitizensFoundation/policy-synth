import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class SupportTextReviewAgent extends PolicySynthAgent {
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(researchItem) {
        await this.updateRangedProgress(0, "Starting support text review");
        await this.reviewNationalLawSupportText(researchItem);
        //await this.reviewNationalRegulationSupportText(researchItem);
        await this.updateRangedProgress(100, "Support text review completed");
    }
    async reviewNationalLawSupportText(researchItem) {
        if (!researchItem.nationalLaw ||
            !researchItem.nationalLaw.supportArticleText)
            return;
        const articles = researchItem.nationalLaw.law.articles;
        const totalArticles = articles.length;
        for (let i = 0; i < totalArticles; i++) {
            const article = articles[i];
            const progress = (i / totalArticles) * 50; // 0% to 50% of total progress
            await this.updateRangedProgress(progress, `Reviewing support text for national law article ${article.number}`);
            if (article.research?.possibleGoldPlating) {
                const supportArticleId = researchItem.supportArticleTextArticleIdMapping[parseInt(article.number)] || parseInt(article.number);
                if (supportArticleId) {
                    const supportArticle = researchItem.nationalLaw.supportArticleText.articles.find((a) => a.number === supportArticleId.toString());
                    if (supportArticle) {
                        const explanation = await this.analyzeSupportText(article, supportArticle);
                        article.research.supportTextExplanation = explanation;
                    }
                }
                else {
                    this.logger.error(`No support text found for article ${article.number} in national law`);
                }
            }
        }
    }
    async reviewNationalRegulationSupportText(researchItem) {
        if (!researchItem.nationalRegulation)
            return;
        let totalArticles = 0;
        researchItem.nationalRegulation.forEach((regulation) => {
            totalArticles += regulation.articles.length;
        });
        let processedArticles = 0;
        for (const regulation of researchItem.nationalRegulation) {
            for (const article of regulation.articles) {
                const progress = 50 + (processedArticles / totalArticles) * 50; // 50% to 100% of total progress
                await this.updateRangedProgress(progress, `Reviewing support text for national regulation article ${article.number}`);
                if (article.research?.possibleGoldPlating) {
                    // For regulations, we don't have separate support text, so we'll use the article's own text as context
                    const explanation = await this.analyzeSupportText(article, article);
                    article.research.supportTextExplanation = explanation;
                }
                processedArticles++;
            }
        }
    }
    async analyzeSupportText(article, supportArticle) {
        const systemMessage = this.createSystemMessage(this.getSupportTextAnalysisSystemPrompt());
        const userMessage = this.createHumanMessage(this.getSupportTextAnalysisUserPrompt(article, supportArticle));
        const result = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, [systemMessage, userMessage], false));
        return result;
    }
    getSupportTextAnalysisSystemPrompt() {
        return `You are an expert legal analyst specializing in interpreting support texts for laws and regulations. Your task is to analyze the support text for a given article that has been identified as potentially containing gold-plating.

Your analysis should focus on:
1. Explaining any justifications provided in the support text for the potential gold-plating.
2. Identifying any additional context that might clarify why the article was implemented in its current form.
3. Noting any explicit mentions of intentional divergence from EU law and the reasons given.
4. Highlighting any explanations for stricter rules, expanded scope, or earlier implementation.

Provide a concise but comprehensive explanation based on the support text. If the support text does not provide relevant information, state that clearly.`;
    }
    getSupportTextAnalysisUserPrompt(article, supportArticle) {
        return `Article with potential gold-plating:
Number: ${article.number}
Text: ${article.text}
Gold-plating concern: ${article.research?.reasonForGoldPlating}

Support text for this article:
Number: ${supportArticle.number}
Text: ${supportArticle.text}

Please analyze the support text and provide an explanation for the potential gold-plating:`;
    }
}
//# sourceMappingURL=reviewAgent.js.map