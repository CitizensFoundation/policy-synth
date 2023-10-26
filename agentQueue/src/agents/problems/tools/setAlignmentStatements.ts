import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

const setupProjectOne = (memory: IEngineInnovationMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.customInstructions.createSolutions = `
    1. Never create solution components in the form of frameworks or holistic approaches
    2. Solution Components should include only one core idea.
    3. The solution component title should indicate the benefits or results of implementing the solution component.
    4. Remember that the main facilitator for implementation will be civil society working with governments.
    5. Frame solution components with the intention of convincing politicians and governments to put them into action.
    6. Avoid blockchain solution components.
  `;

  memory.customInstructions.rankSolutions = `
    1. The main facilitator for implementation will be civil society working with governments.
    2. Later those solution components will be brought into comprehensive policy proposals.
  `;

  memory.customInstructions.rateSolutionsJsonFormat = `
    {
      highPriorityRatings: {
        howImportantToProblem,
        howInnovative,
        howPractical,
        howEthical,
        howComplex,
      },
      otherRatings: {
        benefitsForCitizens,
        benefitsForGovernments,
        benefitsForCivilSociety,
        benefitsForPrivateSector,
        benefitsForTheClimate
      }
    }
  `;

  memory.customInstructions.reapSolutions = `
    1. Solution components should not include more than one core idea.
    2. Solution components can have more than one implementation detail ideas.
    3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
    4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    5. Core ideas are distinct concepts or strategies that are central to the solution component.
  `;
};

const setupProjectTwo = (memory: IEngineInnovationMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.problemStatement.description = `Authoritarians who prioritize political outcomes over independent processes are using unfair and often illegal tactics, including political violence and changes to policies, procedures, and election administration that aim to change the outcome of elections. Authoritarians are using information and communication platforms to undermine belief in the integrity of elections leading, in turn, to declining trust in elections and democracy.`;

  memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to philanthropic organizations, civil society organizations, community-based organizations, and legal advocacy groups.
  `;

  memory.subProblemClientColors = [
    "#ee782d", // Orange (This is not a typical orange, but more of a dark, burnt orange)
    "#0b60b9", // Blue (This is a strong, medium-dark blue)
    "#face2d", // Yellow (This is a bright, somewhat orange-ish yellow)
    "#50c363", // Green (This is a medium, somewhat light green)
    "#ADD8E6", // Light blue
    "#cf1103", // Red (This is a dark, slightly brownish red)
    "#7F00FF", // Violet
    "#3f5fce", // Blue (This is a medium, somewhat light blue, not sea green)
  ];

  memory.customInstructions.subProblemColors = [
    "orange",
    "blue",
    "yellow",
    "green",
    "light blue",
    "red",
    "violet",
    "sea Green",
    "saddle Brown",
    "chocolate",
    "fire Brick",
    "orange Red",
    "yellow Green",
    "gold",
    "dark Khaki",
    "dark Magenta",
    "dark Violet",
    "wheat",
    "forest Green",
    "tan",
    "gray",
    "transparent",
  ];

  memory.customInstructions.createSolutions = `
  1. Never create solution components in the form of frameworks or holistic approaches
  2. Solution components should include only one core idea
  3. Remember that the main facilitator for implementation will be US philanthropic organizations working alongside US civil society organizations, community-based organizations, and legal advocacy groups.
  4. The solution component description should clearly articulate what action the US philanthropic organization needs to take in order to implement the solution in the US.
  5. The solution component description should clearly articulate how the solution component addresses an aspect of the problem.
  6. The solution title should indicate the intended outcomes and impacts of implementing the solution.
`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be implemented by US philanthropic organizations in partnership with US civil society organizations, community-based organizations, and legal advocacy groups.
  `;

  memory.customInstructions.rateSolutionsJsonFormat = `
    {
      highPriorityRatings: {
        howImportantToProblem,
        howInnovative,
        howPractical,
        howEthical,
        howComplex,
      },
      otherRatings: {
        benefitsForCitizens,
        benefitsForGovernments,
        benefitsForCivilSociety,
        benefitsForPrivateSector,
        benefitsForLegalAdvocacyGroups,
        benefitsForPhilanthropicOrganizations
      }
    }
  `;

  memory.customInstructions.reapSolutions = `
    1. Solution components should not include more than one core idea.
    2. Solution components can have more than one implementation detail ideas.
    3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
    4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    5. Core ideas are distinct concepts or strategies that are central to the solution component.
    6. Solutions components should not include ideas that are international in scope.
  `;
};

const setupProjectThree = (memory: IEngineInnovationMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.problemStatement.description = `Climate Change solutions may involve major shifts in cultural/consumer behavior, such as abandoning air travel, universal plant based diet, etc. There are potential issues around popular discourse, historical tradition, economics and commerce, and spiritual beliefs.`;

  memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to philanthropic organizations, civil society organizations, community-based organizations, and legal advocacy groups.
  `;

  memory.subProblemClientColors = [
    "#ee782d", // Orange (This is not a typical orange, but more of a dark, burnt orange)
    "#0b60b9", // Blue (This is a strong, medium-dark blue)
    "#face2d", // Yellow (This is a bright, somewhat orange-ish yellow)
    "#50c363", // Green (This is a medium, somewhat light green)
    "#ADD8E6", // Light blue
    "#cf1103", // Red (This is a dark, slightly brownish red)
    "#7F00FF", // Violet
    "#3f5fce", // Blue (This is a medium, somewhat light blue, not sea green)
  ];

  memory.customInstructions.subProblemColors = [
    "orange",
    "blue",
    "yellow",
    "green",
    "light blue",
    "red",
    "violet",
    "sea Green",
    "saddle Brown",
    "chocolate",
    "fire Brick",
    "orange Red",
    "yellow Green",
    "gold",
    "dark Khaki",
    "dark Magenta",
    "dark Violet",
    "wheat",
    "forest Green",
    "tan",
    "gray",
    "transparent",
  ];

  memory.customInstructions.createSolutions = `
  1. Never create solution components in the form of frameworks or holistic approaches
  2. Solution components should include only one core idea
  3. Remember that the main facilitator for implementation will be international philanthropic organizations working alongside civil society organizations, community-based organizations, and legal advocacy groups.
  4. The solution component description should clearly articulate what action the international philanthropic organization needs to take in order to implement the solution.
  5. The solution component description should clearly articulate how the solution component addresses an aspect of the problem.
  6. The solution title should indicate the intended outcomes and impacts of implementing the solution.
`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be implemented by international philanthropic organizations in partnership with civil society organizations, community-based organizations, and legal advocacy groups.
  `;

  memory.customInstructions.rateSolutionsJsonFormat = `
    {
      highPriorityRatings: {
        howImportantToProblem,
        howInnovative,
        howPractical,
        howEthical,
        howComplex,
      },
      otherRatings: {
        benefitsForCitizens,
        benefitsForGovernments,
        benefitsForCivilSociety,
        benefitsForPrivateSector,
        benefitsForTheClimate,
        benefitsForEcology,
      }
    }
  `;

  memory.customInstructions.reapSolutions = `
    1. Solution components should not include more than one core idea.
    2. Solution components can have more than one implementation detail ideas.
    3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
    4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    5. Core ideas are distinct concepts or strategies that are central to the solution component.
  `;
};

const setupProjectFour = (memory: IEngineInnovationMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }
  // console.log("Project 4 running")
  memory.problemStatement.description = `In 2022, only 54% of our 4th graders in Boston, and 63% of 4th graders nationally, achieved basic reading proficiency on the National Assessment of Educational Progress (NAEP). These drastic gaps in reading achievement are due in part to differences in resources and opportunities available to students. While there has been a new national reckoning regarding evidence-based literacy practices and some school districts are changing  curricula, we know that we can serve our students better and make change happen faster.`;

  memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to parents, students, teachers, policymakers, and other education stakeholders.
  `;

  memory.subProblemClientColors = [
    "#ee782d", // Orange (This is not a typical orange, but more of a dark, burnt orange)
    "#0b60b9", // Blue (This is a strong, medium-dark blue)
    "#face2d", // Yellow (This is a bright, somewhat orange-ish yellow)
    "#50c363", // Green (This is a medium, somewhat light green)
    "#ADD8E6", // Light blue
    "#cf1103", // Red (This is a dark, slightly brownish red)
    "#7F00FF", // Violet
    "#3f5fce", // Blue (This is a medium, somewhat light blue, not sea green)
  ];

  memory.customInstructions.subProblemColors = [
    "orange",
    "blue",
    "yellow",
    "green",
    "light blue",
    "red",
    "violet",
    "sea Green",
    "saddle Brown",
    "chocolate",
    "fire Brick",
    "orange Red",
    "yellow Green",
    "gold",
    "dark Khaki",
    "dark Magenta",
    "dark Violet",
    "wheat",
    "forest Green",
    "tan",
    "gray",
    "transparent",
  ];

  memory.customInstructions.createSolutions = `
  1. Never create solution components in the form of frameworks or holistic approaches
  2. Solution components should include only one core idea
  3. Remember that the main facilitator for implementation will be international philanthropic organizations working alongside civil society organizations, community-based organizations, and legal advocacy groups.
  4. The solution component description should clearly articulate what action the international philanthropic organization needs to take in order to implement the solution.
  5. The solution component description should clearly articulate how the solution component addresses an aspect of the problem.
  6. The solution title should indicate the intended outcomes and impacts of implementing the solution.
`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be implemented by international philanthropic organizations in partnership with civil society organizations, community-based organizations, and legal advocacy groups.
  `;

  memory.customInstructions.rateSolutionsJsonFormat = `
    {
      highPriorityRatings: {
        howImportantToProblem,
        howInnovative,
        howPractical,
        howEthical,
        howComplex,
      },
      otherRatings: {
        benefitsForCitizens,
        benefitsForGovernments,
        benefitsForCivilSociety,
        benefitsForPrivateSector,
        benefitsForTheClimate,
        benefitsForEcology,
      }
    }
  `;

  memory.customInstructions.reapSolutions = `
    1. Solution components should not include more than one core idea.
    2. Solution components can have more than one implementation detail ideas.
    3. If the solution components has two core ideas that are hard to implement without each other then the solution component can be included.
    4. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    5. Core ideas are distinct concepts or strategies that are central to the solution component.
  `;
};

const projectId = process.argv[2];
if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

  if (projectId == "1") {
    setupProjectOne(memory);
  } else if (projectId == "2") {
    setupProjectTwo(memory);
  } else if (projectId == "3") {
    setupProjectThree(memory);
  } else if (projectId == "4") {
    setupProjectFour(memory);
  }

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("After saving");

  process.exit(0);
} else {
  console.log("No project id provided");
  process.exit(1);
}
