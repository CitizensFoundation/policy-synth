import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class JustifyGoldPlatingAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Large;
    maxModelTokensOut = 8192;
    modelTemperature = 0.0;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(researchItem) {
        await this.updateRangedProgress(0, "Starting gold-plating justification analysis");
        await this.justifyNationalLawGoldPlating(researchItem);
        await this.justifyNationalRegulationGoldPlating(researchItem);
        await this.updateRangedProgress(100, "Gold-plating justification analysis completed");
    }
    async justifyNationalLawGoldPlating(researchItem) {
        if (!researchItem.nationalLaw)
            return;
        const articles = researchItem.nationalLaw.law.articles;
        const totalArticles = articles.length;
        for (let i = 0; i < totalArticles; i++) {
            this.logger.info(`Analyzing justification for national law article ${articles[i].number}`);
            const article = articles[i];
            const progress = (i / totalArticles) * 50; // 0% to 50% of total progress
            await this.updateRangedProgress(progress, `Analyzing justification for national law article ${article.number}`);
            if (article.research?.possibleGoldPlating) {
                let justification;
                if (article.research.supportTextExplanation) {
                    justification = await this.analyzeJustification(article, researchItem.euDirective.fullText, article.research.englishTranslationOfIcelandicArticle, article.research.euLawExtract || "N/A");
                }
                else {
                    this.logger.info(`No support text explanation for article ${article.number}`);
                }
                if (justification && !justification.fullyJustifiedGoldPlating) {
                    const secondCheck = await this.checkEURegulationMinimums(article, researchItem.euDirective.fullText, article.research.englishTranslationOfIcelandicArticle, article.research.euLawExtract || "N/A");
                    if (secondCheck.fullyJustifiedGoldPlating) {
                        article.research.likelyJustified = true;
                        article.research.justification =
                            secondCheck.justificationForGoldPlating;
                    }
                    else {
                        article.research.likelyJustified = false;
                        article.research.justification =
                            "No justification found for gold-plating";
                    }
                }
                else if (justification) {
                    article.research.likelyJustified =
                        justification.fullyJustifiedGoldPlating;
                    article.research.justification =
                        justification.justificationForGoldPlating;
                }
                await this.saveMemory();
            }
            else {
                this.logger.info(`No possible gold-plating for article ${article.number}`);
            }
        }
    }
    async justifyNationalRegulationGoldPlating(researchItem) {
        if (!researchItem.nationalRegulation)
            return;
        let totalArticles = 0;
        researchItem.nationalRegulation.forEach((regulation) => {
            totalArticles += regulation.articles.length;
        });
        let processedArticles = 0;
        for (const regulation of researchItem.nationalRegulation) {
            const allSupportText = regulation.articles
                .map((article) => article.research?.supportTextExplanation || "")
                .join("\n\n");
            for (const article of regulation.articles) {
                const progress = 50 + (processedArticles / totalArticles) * 50; // 50% to 100% of total progress
                await this.updateRangedProgress(progress, `Analyzing justification for national regulation article ${article.number}`);
                if (article.research?.possibleGoldPlating) {
                    const justification = await this.analyzeJustification(article, researchItem.euDirective.fullText, article.research.englishTranslationOfIcelandicArticle, article.research.euLawExtract || "N/A");
                    this.logger.debug(`Justification: ${JSON.stringify(justification, null, 2)}`);
                    if (!justification.fullyJustifiedGoldPlating) {
                        const secondCheck = await this.checkEURegulationMinimums(article, researchItem.euDirective.fullText, article.research.englishTranslationOfIcelandicArticle, article.research.euLawExtract || "N/A");
                        this.logger.debug(`secondCheck: ${JSON.stringify(secondCheck, null, 2)}`);
                        if (secondCheck.fullyJustifiedGoldPlating) {
                            article.research.likelyJustified = true;
                            article.research.justification =
                                secondCheck.justificationForGoldPlating;
                        }
                        else {
                            article.research.likelyJustified = false;
                            article.research.justification =
                                "No justification found for gold-plating";
                        }
                    }
                    else {
                        article.research.likelyJustified =
                            justification.fullyJustifiedGoldPlating;
                        article.research.justification =
                            justification.justificationForGoldPlating;
                    }
                    await this.saveMemory();
                }
                processedArticles++;
            }
        }
    }
    async analyzeJustification(article, euDirectiveFullText, englishTranslation, euLawExtract, allSupportText) {
        const systemMessage = this.createSystemMessage(this.getJustificationAnalysisSystemPrompt(euDirectiveFullText, allSupportText));
        const userMessage = this.createHumanMessage(this.getJustificationAnalysisUserPrompt(article, englishTranslation, euLawExtract));
        const result = (await this.callModel(PsAiModelType.Text, this.modelSize, [systemMessage, userMessage], true));
        return result;
    }
    async checkEURegulationMinimums(article, euDirectiveFullText, englishTranslation, euLawExtract) {
        const systemMessage = this.createSystemMessage(this.getEURegulationMinimumsSystemPrompt(euDirectiveFullText));
        const userMessage = this.createHumanMessage(this.getEURegulationMinimumsUserPrompt(article, englishTranslation, euLawExtract));
        const result = (await this.callModel(PsAiModelType.Text, this.modelSize, [systemMessage, userMessage], true));
        return result;
    }
    getJustificationAnalysisSystemPrompt(euDirectiveFullText, allSupportText) {
        return `<JustificationAnalysisSystem>
You are an expert legal analyst specializing in EU and national law comparisons.
Your task is to analyze gold-plating that has been confirmed in national laws or regulations and determine if there's a full justification for it.

Consider the following when analyzing:
1. The context and intent of the national law or regulation.
2. Any specific national circumstances that might necessitate stricter or more detailed rules.
3. The potential benefits of gold-plating for the national legal or regulatory framework.
4. Whether the gold-plating aligns with the overall objectives of the EU directive.
5. The justification needs to be very clear if the gold plating is adding regulatory costs, increased administrative burdens, and restrictions that may hinder innovation or growth.

Here is the full text of the EU Directive for reference:

<FullEuDirective>
${euDirectiveFullText}
</FullEuDirective>

${allSupportText
            ? `<AllLawSupportExplainationText>${allSupportText}</AllLawSupportExplainationText>`
            : ``}

Provide your analysis in JSON format with two fields:

\`\`\`json
  {
    justificationForGoldPlating: string;
    fullyJustifiedGoldPlating: boolean;
  }
  \`\`\`
</JustificationAnalysisSystem>`;
    }
    getJustificationAnalysisUserPrompt(article, englishTranslation, euLawExtract) {
        return `Article with possible justifiable gold-plating:
Number: ${article.number}
Text: ${article.text}
English Translation: ${englishTranslation}
Support text explanation: ${article.research?.supportTextExplanation
            ? `Support text explanation to review for justification: ${article.research?.supportTextExplanation}`
            : ""}

Relevant EU Directive extract:
${euLawExtract}

Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in JSON markdown format:`;
    }
    getEURegulationMinimumsSystemPrompt(euDirectiveFullText) {
        return `<EURegulationMinimumsSystem>
You are an expert legal analyst specializing in EU and national law comparisons.
Your task is to analyze gold-plating in an article that has been confirmed in national laws or regulations and determine if there's a full justification for it.

Consider the following:
1. Whether the EU directive explicitly states that it sets minimum standards.
2. If the directive uses language that suggests member states should or may elaborate on certain points.
3. The justification needs to be very clear if the gold plating is adding regulatory costs, increased administrative burdens, and restrictions that may hinder innovation or growth.


<FullEuDirective>
${euDirectiveFullText}
</FullEuDirective>

Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in JSON markdown format:
\`\`\`json
  {
    justificationForGoldPlating: string;
    fullyJustifiedGoldPlating: boolean;
  }
  \`\`\`
</EURegulationMinimumsSystem>`;
    }
    getEURegulationMinimumsUserPrompt(article, englishTranslation, euLawExtract) {
        return `Article with potential gold-plating:
Number: ${article.number}
Text: ${article.text}
English Translation: ${englishTranslation}

Relevant EU Directive extract:
${euLawExtract}

Let's think step by step. First, start by outlining your reasoning in analysing if there is justification for gold plating, then output in this JSON markdown format:`;
    }
}
//# sourceMappingURL=justifyGoldPlating.js.map