import { BaseProcessor } from "../../../baseProcessor.js";
import { IEngineConstants } from "../../../../constants.js";
import { PCA } from "ml-pca";
import { Configuration, OpenAIApi } from "openai";
import { DBSCAN } from "density-clustering";
import { agnes } from "ml-hclust";
const includeDescriptionInVector = true;
//TODO: Depricated and not used, the GPT-4 grouping is much better
export class TopicMapSolutionsProcessor extends BaseProcessor {
    async getAllSolutionVectors(solutions) {
        // Get the vector embeddings of the solutions using OpenAI API
        const vectors = await Promise.all(solutions.map((solution) => this.generateVector(includeDescriptionInVector
            ? `${solution.title} ${solution.description}`
            : `${solution.title}`)));
        this.logger.debug("Got all vectors");
        // Combine the solutions with their corresponding vector embeddings
        const solutionVectors = solutions.map((solution, i) => ({
            ...solution,
            vector: vectors[i],
        }));
        this.logger.debug("Combined solutions with vectors");
        return solutionVectors;
    }
    async addCosts(tokensInCount) {
        //this.logger.debug(`Adding costs for ${tokensInCount} tokens in`);
        if (!this.memory.stages["topic-map-solutions"]) {
            this.memory.stages["topic-map-solutions"] = {
                tokensIn: 0,
                tokensOut: 0,
                tokensInCost: 0,
                tokensOutCost: 0,
            };
        }
        if (this.memory.stages["topic-map-solutions"].tokensIn === undefined) {
            this.memory.stages["topic-map-solutions"].tokensIn = 0;
            this.memory.stages["topic-map-solutions"].tokensInCost = 0;
        }
        this.memory.stages["topic-map-solutions"].tokensIn += tokensInCount;
        this.memory.stages["topic-map-solutions"].tokensInCost +=
            tokensInCount * IEngineConstants.topicMapSolutionsModel.inTokenCostsUSD;
    }
    async generateVector(prompt) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        let vector;
        let retryCount = 0;
        const maxRetries = IEngineConstants.mainLLMmaxRetryCount;
        let retry = true;
        while (retry && retryCount < maxRetries) {
            try {
                const response = (await openai.createEmbedding({
                    model: "text-embedding-ada-002",
                    input: prompt,
                }));
                this.logger.debug(`Got embeddings`);
                vector = response.data.data[0].embedding;
                await this.addCosts(response.data.usage.total_tokens);
                //@ts-ignore
                retry = false;
            }
            catch (error) {
                this.logger.warn("Error from LLM, retrying");
                this.logger.warn(error);
                // Output the stack strace
                this.logger.warn(error.stack);
                if (retryCount >= maxRetries) {
                    throw error;
                }
                else {
                    retryCount++;
                }
            }
            if (retry) {
                const sleepTime = 4500 + retryCount * 5000;
                this.logger.debug(`Sleeping for ${sleepTime} ms before retrying. Retry count: ${retryCount}}`);
                await new Promise((resolve) => setTimeout(resolve, sleepTime));
            }
        }
        //this.logger.debug(`Got vector for: ${prompt}`);
        return vector;
    }
    applyClustering(data, method) {
        let clusters = [];
        let filteredData = data.filter(x => x !== undefined);
        switch (method) {
            case "PCA_DBSCAN":
                // Apply PCA to reduce the dimensions of the data
                const pca = new PCA(data);
                const reducedData = pca.predict(data, { nComponents: 2 });
                // Cluster the reduced data using DBSCAN
                const dbscan = new DBSCAN();
                clusters = dbscan.run(reducedData.data, 0.07, 12);
                break;
            case "AGNES":
                const treeA = agnes(data, { method: 'ward' });
                clusters = treeA.cut(0.0005); // Adjust this according to your needs
                break;
            case "DIANA":
                //        const treeD = diana(data);
                //        clusters = treeD.cut(1.5); // Adjust this according to your needs
                break;
            case "OPTICS":
                //        const optics = new OPTICS();
                //        clusters = optics.run(filteredData, 2, 2); // The parameters are: dataset, epsilon, minimum points
                break;
            // Add cases for BIRCH, CURE, CHAMELEON when you find or develop appropriate implementations
            default:
                throw new Error("Invalid method: " + method);
        }
        return clusters;
    }
    async topicMapSolutionsForSubProblem(subProblemIndex, solutions) {
        this.logger.info(`Topic mapping solutions for subproblem ${subProblemIndex}`);
        // Fetch all solutions and their vector embeddings
        const solutionVectors = await this.getAllSolutionVectors(solutions);
        this.logger.debug(`Got ${solutionVectors.length} solution vectors`);
        // Extract the vector embeddings
        const vectors = solutionVectors.map((solution) => solution.vector);
        const clusters = this.applyClustering(vectors, "PCA_DBSCAN");
        let groupIndex = 0;
        for (const cluster of clusters) {
            if (cluster.length > 1) {
                // Ignore groups with only one solution
                for (const solutionIndex of cluster) {
                    if (solutionIndex < solutions.length) {
                        solutions[solutionIndex].similarityGroup = {
                            index: groupIndex,
                            totalCount: cluster.length,
                        };
                        this.logger.info(`Clusterd solution: ${solutions[solutionIndex].title}`);
                    }
                }
                groupIndex += 1;
            }
        }
    }
    async calculateGroupStats(solutions) {
        let groupCount = 0;
        let ungroupedSolutionsCount = 0;
        const groupSizes = {};
        solutions.forEach((solution) => {
            if (solution.similarityGroup &&
                solution.similarityGroup.index !== undefined) {
                groupCount = Math.max(groupCount, solution.similarityGroup.index + 1);
                groupSizes[solution.similarityGroup.index] =
                    (groupSizes[solution.similarityGroup.index] || 0) + 1;
            }
            else {
                ungroupedSolutionsCount += 1;
            }
        });
        this.logger.info(`Total cluster: ${groupCount}`);
        this.logger.info(`Number of solutions in each cluster: ${JSON.stringify(groupSizes, null, 2)}`);
        this.logger.info(`Number of solutions not in any cluster: ${ungroupedSolutionsCount}`);
    }
    async topicMapSolutions() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const solutions = this.memory.subProblems[subProblemIndex].solutions.populations[this.lastPopulationIndex(subProblemIndex)];
            solutions.forEach((solution) => {
                solution.similarityGroup = undefined;
            });
            await this.topicMapSolutionsForSubProblem(subProblemIndex, solutions);
            this.calculateGroupStats(solutions);
            await this.saveMemory();
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished Topic Map for all");
    }
    async process() {
        this.logger.info("Topic Map Solution Components Processor");
        super.process();
        try {
            await this.topicMapSolutions();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
