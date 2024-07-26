import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
import ioredis from "ioredis";
import fs from "fs/promises";
import path from "path";

import fetch from "node-fetch";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
//@ts-ignore
global.fetch = fetch;

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

const externalSolutionsElectionViolence = [
  {
    description: "Invest in Early Warning Response Systems (EWRS) - tools which use data and research findings to predict instances of violence – with an emphasis on rapidly delivering intelligence about threats to elections groups working at the local level.",
  },
  {
    description: "Invest in de-escalation training for election officials to equip them with strategies to prepare for and effectively respond to potentially violent incidents.",
  },
  {
    description: "Explore how changes to law - such as better protections for the personal identifying information of election officials and judges, or introducing stiffer penalties for threats targeting public servants – could prevent acts of violence.",
  },
  {
    description: "Invest in building stronger relationships among elected officials and law enforcement to allow law enforcement to better anticipate, prepare for, and respond to violent threats and actions. ",
  },
  {
    description: "Invest in longitudinal data collection about violent threats, attitudes, political beliefs that justify violence, and other data related to violence to better understand the risk of violence and make better predictions. Collecting data about violent acts alone is insufficient.",
  },
  {
    description: "Fund a multidisciplinary research collaborative to develop and test effective messaging strategies, borrowing from successful campaigns in other domains, and designed to combat the spread of anti-democratic ideas.",
  },
  {
    description: "Fund efforts to proactively respond to and counter online hate speech that fuels violence.",
  },
  {
    description: "Support more transparent, resilient, and bipartisan election administration practices that build public confidence in electoral procedures and outcomes.",
  },
  {
    description: "Invest in civic engagement projects that get citizens more involved in elections, helping to educate and build trust in the electoral process.",
  },
  {
    description: "Explore how to engage with social media companies in developing and implementing solutions to stop the spread of misinformation on their platforms which fuels election violence.",
  },
  {
    description: "dvocate for Congress to take a leading role in combating violent threats and acts against election officials.",
  },
  {
    description: "enter local communities – in particular, communities of color and other groups who have historically been targeted by political violence – in grantmaking decisions around election violence",
  },
  {
    description: "Provide sustained funding that allows groups to work on election violence issues continuously across election cycles. ",
  }
];


const externalSolutionsMisuseOfLegalSystem = [
  {
    description:
      "Encourage organizations and bodies with disciplinary authority to take swift action against groups, attorneys, and law firms who have advanced malicious litigation.",
  },
  {
    description:
      "Invest in legal education to better teach professional responsibility and support professional development opportunities for students in order to train the next generation of lawyers to fulfill their role as guardians of democracy, elections and the Constitution. ",
  },
  {
    description:
      "Invest in capacity building, and legal advocacy to better protect election offices from malicious litigation. ",
  },
  {
    description:
      "Invest in resources to support groups who track, report on, or carry out legal advocacy challenging malicious litigation. ",
  },
  {
    description:
      "Invest in research to understand how the courts can more effectively deal with malicious litigations.",
  },
  {
    description:
      "Engage key stakeholders in the process of developing solutions to the problem of malicious litigation.",
  },
  {
    description:
      "Invest in policy research to understand how potential changes to FOI laws and policies will impact public access to information, and in particular, the negative knock-on consequences of policy changes.",
  },
  {
    description:
      "Invest in training, data infrastructure, staffing, and other forms of capacity building that enable election offices to proactively release more election-related information, which can allow offices to head-off vexatious or duplicative requests.",
  },
  {
    description:
      "Invest in training, data infrastructure, staffing, and other forms of capacity building that enable election offices to process and respond to FOI requests more efficiently and effectively.",
  },
  {
    description:
      "Invest in research and policy advocacy to pilot administrative changes designed to limit vexatious FOI requests.",
  },
  {
    description:
      "Fund research and further engagement with experts to fully understand the scope of the problem.",
  },
  {
    description:
      "Invest in improving administrative processes, filling funding gaps, and providing election offices with the resources they need to continue to run elections with minimal errors and disruptions.",
  },
  {
    description:
      "Invest in research, and provide sustained funding to on-the-ground organizations, to enable the election protection groups to anticipate, and prepare to respond, to future election subversion campaigns.",
  },
  {
    description:
      "Engage communities and build coalitions to ensure that the voices of key stakeholders are represented in funding decisions related to election administration. ",
  },
];

export class AnalyseExternalSolutions extends SolutionsEvolutionSmarterCrowdsourcingAgent {
  folderPath!: string;

  async renderAnalysisPrompt(solutionDescription: string, requirement: string) {
    const messages = [
      this.createSystemMessage(
        `
        1. You are an expert in analyzing how well a solution matches a requirement
        2. Always and only output the following JSON format: { solutionCoversPercentOfKeyRequirements }        `
      ),
      this.createHumanMessage(
        `
        Requirement:
        ${requirement}

        Solution:
        ${solutionDescription}

        Let's think step by step.

        JSON Output:       `
      ),
    ];

    return messages;
  }

  async compareSolutionToExternal(
    solutionDescription: string,
    requirement: string
  ) {
    const result = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      await this.renderAnalysisPrompt(solutionDescription, requirement)
    )) as PsExternalSolutionAnalysisResults;

    return result;
  }

  async analyze() {
    const externalSolutions = externalSolutionsElectionViolence;
    const minimumPercent = 0; // 70
    const subProblemIndex = 5;
    const startPopulationIndex = 15;
    const analysisResults: PsExternalSolutionAnalysis[] = [];

    const numberOfPopulations = 16; //this.numberOfPopulations(subProblemIndex);

    for (
      let populationIndex = startPopulationIndex;
      populationIndex < numberOfPopulations;
      populationIndex++
    ) {
      const externalSolutionLimit = externalSolutions.length;

      const externalSolutionPromises = Array.from(
        { length: externalSolutionLimit },
        async (_, externalSolutionIndex) => {
          const solutions = this.getActiveSolutionsFromPopulation(
            subProblemIndex,
            populationIndex
          );

          const matches = {
            externalSolutionIndex: externalSolutionIndex,
            externalSolution:
              externalSolutions[externalSolutionIndex].description,
            subProblemIndex,
            populationIndex,
            topSolutionMatches: [],
          } as PsExternalSolutionAnalysis;

          for (
            let solutionIndex = 0;
            solutionIndex < solutions.length;
            solutionIndex++
          ) {
            this.logger.info(
              `Analyzing ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} (${populationIndex})`
            );

            const solution = solutions[solutionIndex];

            const solutionResults = await this.compareSolutionToExternal(
              solution.description,
              externalSolutions[externalSolutionIndex].description
            );

            const percent =
              solutionResults.solutionCoversPercentOfKeyRequirements;

            this.logger.debug(`Percent match: ${percent}`)

            if (percent >= minimumPercent) {
              matches.topSolutionMatches.push({
                index: solutionIndex,
                title: solution.title,
                description: solution.description,
                percent: percent,
              });
            }
            this.logger.debug(solution.title);

            await this.saveMemory();
          }

          analysisResults.push(matches);
        }
      );

      await Promise.all(externalSolutionPromises);

      this.logger.debug(JSON.stringify(analysisResults, null, 2));

      await this.saveCSV(analysisResults);
    }

    this.logger.info("Finished analysing all");
  }

  toCSV(analysisResult: PsExternalSolutionAnalysis): string {
    let csvText = `"Sub Problem",Population,"Recommendation ${analysisResult.externalSolutionIndex+1}"\n`;
    csvText += `${analysisResult.subProblemIndex},${analysisResult.populationIndex},"${analysisResult.externalSolution}"\n`;
    csvText += "Match,Rank,Description,Title,URL\n";
    analysisResult.topSolutionMatches.sort((a, b) => b.percent - a.percent);

    analysisResult.topSolutionMatches.forEach((match) => {
      const url = `https://policy-synth.ai/projects/${this.memory.groupId}/${analysisResult.subProblemIndex}/${analysisResult.populationIndex}/${match.index}`;
      csvText += `${match.percent},${match.index},"${match.description}","${match.title}","${url}"\n`;
    });

    return csvText;
  }

  async processAnalysis(folderPath: string) {
    this.folderPath = folderPath;
    this.logger.info("Create Analysis Agent");
    super.process();

    try {
      await this.analyze();
    } catch (error: any) {
      this.logger.error(error);
      this.logger.error(error.stack);
      throw error;
    }
  }

  async saveCSV(analysisResults: PsExternalSolutionAnalysis[]) {
    try {
      // Check if folder exists, create it if not
      await fs.stat(this.folderPath);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // Folder does not exist, create it
        await fs.mkdir(this.folderPath, { recursive: true });
      } else {
        throw error; // Re-throw other errors
      }
    }

    for (let i = 0; i < analysisResults.length; i++) {
      try {
        const csvText = this.toCSV(analysisResults[i]);
        const fileName = `external_solution_${analysisResults[i].subProblemIndex}_${analysisResults[i].externalSolutionIndex}_${analysisResults[i].populationIndex}.csv`;
        const fullPath = path.join(this.folderPath, fileName);
        await fs.writeFile(fullPath, csvText);
      } catch (error) {
        this.logger.error(
          `Error saving CSV file for external solution ${i}: ${error}`
        );
      }
    }
  }
}

async function run() {
  const projectId = process.argv[2];
  const folderPath = process.argv[3];

  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

    const counts = new AnalyseExternalSolutions({} as any, memory, 1, 1);
    await counts.processAnalysis(folderPath);
    process.exit(0);
  } else {
    console.log("No project id provided - analyse external solutions");
    process.exit(1);
  }
}

run();
