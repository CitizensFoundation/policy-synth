import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAiModelType, PsAiModelSize, } from "@policysynth/agents/aiModelTypes.js";
export class GoldPlatingSearchAgent extends PolicySynthAgent {
    modelSize = PsAiModelSize.Medium;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
    }
    async processItem(researchItem) {
        await this.updateRangedProgress(0, "Starting gold-plating search");
        await this.compareNationalLawToEULaw(researchItem);
        await this.compareNationalRegulationToEULaw(researchItem);
        await this.compareNationalLawToEURegulation(researchItem);
        await this.compareNationalRegulationToEURegulation(researchItem);
        await this.updateRangedProgress(100, "Gold-plating search completed");
    }
    async compareNationalLawToEULaw(researchItem) {
        if (!researchItem.nationalLaw || !researchItem.euDirective)
            return;
        const totalArticles = researchItem.nationalLaw.law.articles.length;
        for (let i = 0; i < totalArticles; i++) {
            const article = researchItem.nationalLaw.law.articles[i];
            const progress = (i / totalArticles) * 25; // 25% of total progress
            await this.updateRangedProgress(progress, `Analyzing national law article ${article.number}`);
            const goldPlatingResult = (await this.analyzeGoldPlating(researchItem.nationalLaw.law.fullText, researchItem.euDirective.fullText, article.text, "law"));
            article.research = this.processGoldPlatingResult(goldPlatingResult, researchItem.nationalLaw.law.url);
        }
    }
    async compareNationalRegulationToEULaw(researchItem) {
        if (!researchItem.nationalRegulation || !researchItem.euDirective)
            return;
        let totalArticles = 0;
        researchItem.nationalRegulation.forEach((regulation) => {
            totalArticles += regulation.articles.length;
        });
        let processedArticles = 0;
        for (const regulation of researchItem.nationalRegulation) {
            for (const article of regulation.articles) {
                const progress = 25 + (processedArticles / totalArticles) * 25; // 25% to 50% of total progress
                await this.updateRangedProgress(progress, `Analyzing national regulation article ${article.number}`);
                const goldPlatingResult = await this.analyzeGoldPlating(regulation.fullText, researchItem.euDirective.fullText, article.text, "regulation");
                article.research = this.processGoldPlatingResult(goldPlatingResult, regulation.url);
                processedArticles++;
            }
        }
    }
    async compareNationalLawToEURegulation(researchItem) {
        if (!researchItem.nationalLaw || !researchItem.euRegulation)
            return;
        const totalArticles = researchItem.nationalLaw.law.articles.length;
        for (let i = 0; i < totalArticles; i++) {
            const article = researchItem.nationalLaw.law.articles[i];
            const progress = 50 + (i / totalArticles) * 25; // 50% to 75% of total progress
            await this.updateRangedProgress(progress, `Analyzing national law article ${article.number} against EU regulation`);
            const goldPlatingResult = await this.analyzeGoldPlating(researchItem.nationalLaw.law.fullText, researchItem.euRegulation.fullText, article.text, "law");
            JSON.stringify(goldPlatingResult, null, 2);
            article.research = this.processGoldPlatingResult(goldPlatingResult, researchItem.nationalLaw.law.url);
            await this.saveMemory();
        }
    }
    async compareNationalRegulationToEURegulation(researchItem) {
        if (!researchItem.nationalRegulation || !researchItem.euRegulation)
            return;
        let totalArticles = 0;
        researchItem.nationalRegulation.forEach((regulation) => {
            totalArticles += regulation.articles.length;
        });
        let processedArticles = 0;
        for (const regulation of researchItem.nationalRegulation) {
            for (const article of regulation.articles) {
                const progress = 75 + (processedArticles / totalArticles) * 25; // 75% to 100% of total progress
                await this.updateRangedProgress(progress, `Analyzing national regulation article ${article.number} against EU regulation`);
                const goldPlatingResult = await this.analyzeGoldPlating(regulation.fullText, researchItem.euRegulation.fullText, article.text, "regulation");
                article.research = this.processGoldPlatingResult(goldPlatingResult, regulation.url);
                processedArticles++;
                await this.saveMemory();
            }
        }
    }
    async analyzeGoldPlating(icelandicLaw, euLaw, articleToAnalyze, type) {
        const systemMessage = this.createSystemMessage(this.getGoldPlatingSystemPrompt(type));
        const userMessage = this.createHumanMessage(this.getGoldPlatingUserPrompt(icelandicLaw, euLaw, articleToAnalyze, type));
        const result = await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, [systemMessage, userMessage], true);
        return result;
    }
    processGoldPlatingResult(result, url) {
        const research = {
            possibleGoldPlating: false,
            description: "",
            url: url,
            reasonForGoldPlating: "",
            recommendation: "",
            results: {
                detailedRules: "",
                expandedScope: "",
                exemptionsNotUtilized: "",
                stricterNationalLaws: "",
                disproportionatePenalties: "",
                earlierImplementation: "",
                conclusion: "",
            },
        };
        if (result.conclusion &&
            !result.conclusion.toLowerCase().includes("no gold plating was found") &&
            result.conclusion.toLowerCase().includes("gold plating was found")) {
            research.possibleGoldPlating = true;
            research.description = result.conclusion;
            research.results = result.analysis;
            research.reasonForGoldPlating = result.reasonsForGoldPlating;
            research.recommendation =
                "Further review recommended to address potential gold-plating issues.";
        }
        return research;
    }
    extractReasonForGoldPlating(analysis) {
        const reasons = [];
        for (const key in analysis) {
            if (analysis[key] &&
                !analysis[key].toLowerCase().includes("no evidence")) {
                reasons.push(`${key}: ${analysis[key]}`);
            }
        }
        return reasons.join(" ");
    }
    getGoldPlatingSystemPrompt(type) {
        return `You are an expert legal analyst specializing in comparative law and regulations between Icelandic and EU legislation.
    Your task is to analyze whether the provided Icelandic ${type} implementing EU law exhibits any signs of gold plating.

First, let's define gold plating in the context of Icelandic ${type} implementing EU law:

Gold plating refers to the practice of:
1. Setting more detailed rules than the minimum requirements.
2. Expanding the scope of the directive beyond its original intent.
3. Not fully utilizing exemptions allowed in the directive.
4. Maintaining stricter national laws than what the directive requires.
5. Imposing penalties that are not in line with good legislative practice.
6. Implementing a directive earlier than the date specified in it.

Your task is to carefully analyze the Icelandic ${type} in comparison to the EU law and determine if there are any instances of gold plating. Follow these steps:

1. Carefully read both the Icelandic ${type} and the EU law for full context.
2. Then review the <icelandic_${type}_article_to_analyse> provided, focusing on the six aspects of gold plating mentioned in the definition.
3. You will be provided with the full law but then one article at the time in a loop, calling you multiple times so only look at <icelandic_${type}_article_to_analyse> for your analysis.
4. For each aspect of gold plating, determine if it is present in the <icelandic_${type}_article_to_analyse>.
5. If you find an instance of gold plating, note the specific section of the <icelandic_${type}_article_to_analyse> where it occurs and explain how it differs from the EU law.
6. If you do not find any instances of gold plating for a particular aspect, state that clearly.
7. If you do find gold plating always start the conclusion with the word: "gold plating was found"

Present your analysis in the following JSON format:

{
  "analysis": {
    "detailedRules": "Your analysis here",
    "expandedScope": "Your analysis here",
    "exemptionsNotUtilized": "Your analysis here",
    "stricterNationalLaws": "Your analysis here",
    "disproportionatePenalties": "Your analysis here",
    "earlierImplementation": "Your analysis here"
  },
  "conclusion": "Summarize your findings here, stating whether gold plating was found and in which aspects",
  "reasonsForGoldPlating": "Provide reasons for gold plating only if found otherwise leave empty",
}

Remember to be thorough in your analysis and provide specific examples to support your conclusions.
If you're unsure about any aspect, state your uncertainty clearly.`;
    }
    getGoldPlatingUserPrompt(icelandicLaw, euLaw, articleToAnalyze, type) {
        return `Now, here is the Icelandic law to be analyzed:

<the_full_icelandic_law>
${icelandicLaw}
</the_full_icelandic_law>

And here is the corresponding EU law:

<eu_law>
${euLaw}
</eu_law>

<icelandic_${type}_article_to_analyse>
${articleToAnalyze}
</icelandic_law_article_to_analyse>

Your analysis of the <icelandic_${type}_article_to_analyse> in JSON format:`;
    }
}
//# sourceMappingURL=researchArticles.js.map