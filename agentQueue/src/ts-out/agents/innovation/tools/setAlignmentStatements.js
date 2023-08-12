import ioredis from "ioredis";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
const setupProjectOne = (memory) => {
    if (!memory.customInstructions) {
        memory.customInstructions = {};
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
    1. Assess the solution components based on its title and description.
    2. Later those solution components will be brought into comprehensive policy proposals.
    3. Use provided ratings also in a thoughtful and balanced way for your decision.
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
    1. Filter out solution components that include more than two unique core ideas, if the ideas are closely related then do not filter them out.
    2. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    3. Core ideas are distinct concepts or strategies that are central to the solution component.
    4. If a solution component includes multiple strategies or methods that serve to implement or facilitate a single core idea, do not consider these as separate core ideas. Instead, view them as parts of a comprehensive approach to implementing the core idea.
  `;
};
const setupProjectTwo = (memory) => {
    if (!memory.customInstructions) {
        memory.customInstructions = {};
    }
    memory.problemStatement.description = `Authoritarians who prioritize political outcomes over independent processes are using unfair and often illegal tactics, including political violence and changes to policies, procedures, and election administration that aim to change the outcome of elections. Authoritarians are using information and communication platforms to undermine belief in the integrity of elections leading, in turn, to declining trust in elections and democracy.`;
    memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to philanthropic organizations, civil society organizations, community-based organizations, and legal advocacy groups.
  `;
    memory.subProblemClientColors = [
        '#ee782d',
        '#0b60b9',
        '#face2d',
        '#50c363',
        '#ADD8E6',
        '#cf1103',
        '#7F00FF',
        '#3f5fce', // Blue (This is a medium, somewhat light blue, not sea green)
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
  3. Remember that the main facilitator for implementation will be philanthropic organizations working alongside civil society organizations, community-based organizations, and legal advocacy groups.
  4. The solution component description should clearly articulate what action the philanthropic organization needs to take in order to implement the solution.
  5. The solution component description should clearly articulate how the solution component addresses an aspect of the problem.
  6. The solution title should indicate the intended outcomes and impacts of implementing the solution.
`;
    memory.customInstructions.rankSolutions = `
    1. Assess the solution components based on its title and description.
    2. Later those solution components will be brought into comprehensive policy proposals.
    3. Use provided ratings also in a thoughtful and balanced way for your decision.
    4. The solution components will be implemented by philanthropic organizations in partnership with civil society organizations, community-based organizations, and legal advocacy groups.
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
    1. Filter out solution components that include more than two unique core ideas, if the ideas are closely related then do not filter them out.
    2. Phrases that describe the impact or outcome of implementing the core ideas should not be counted as separate core ideas.
    3. Core ideas are distinct concepts or strategies that are central to the solution component.
    4. Be careful not filtering out any solution components that are not too complex.
  `;
};
const projectId = process.argv[2];
if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const output = await redis.get(redisKey);
    const memory = JSON.parse(output);
    if (projectId == "1") {
        setupProjectOne(memory);
    }
    else if (projectId == "2") {
        setupProjectTwo(memory);
    }
    await redis.set(redisKey, JSON.stringify(memory));
    console.log("After saving");
    process.exit(0);
}
else {
    console.log("No project id provided");
    process.exit(1);
}
