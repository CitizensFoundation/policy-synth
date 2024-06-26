import { Queue } from "bullmq";
import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

const setupProjectOne = (memory: PsSmarterCrowdsourcingMemoryData) => {
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

const setupProjectTwo = (memory: PsSmarterCrowdsourcingMemoryData) => {
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

const setupProjectThree = (memory: PsSmarterCrowdsourcingMemoryData) => {
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

const setupProjectFour = (memory: PsSmarterCrowdsourcingMemoryData) => {
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
  3. Remember that the main facilitator for implementation will be parents, students, teachers, policymakers, and other education stakeholders.
  4. The solution component description should clearly articulate what action is needed to implement the solution.
  5. The solution component description should clearly articulate how the solution component addresses an aspect of the problem.
  6. The solution title should indicate the intended outcomes and impacts of implementing the solution.
`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be implemented by will be parents, students, teachers, policymakers, and other education stakeholders.
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
        benefitsForSchools,
        benefitsForTeachers,
        benefitsForStudents,
        benefitsForParents,
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

const setupProjectFive = (memory: PsSmarterCrowdsourcingMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }
  // console.log("Project 5 running")
  memory.problemStatement.description = `Political instability is often driven by ineffective policymaking that fails to adapt to rapid technological changes, global economic shifts, and environmental challenges. This failure exacerbates issues like resource scarcity, healthcare and education disparities, and undermines human rights and freedoms. Such inadequate governance creates a complex web of social and economic problems, hindering the development of competent policies crucial for contemporary societal needs and global interdependence.`;

  memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to civil soecity and policymakers.
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
        benefitsForPolicitians,
        benefitsForPrivateSector,
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

const setupProjectSix = (memory: PsSmarterCrowdsourcingMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }
  // console.log("Project 6 running")
  memory.problemStatement.description =
    "In modern democracies, government policymaking processes are increasingly struggling to keep pace with the rapidly evolving dynamics of society. This struggle is evident in the delayed implementation of policies, a growing misalignment between governmental actions and public needs, and a general inflexibility in adapting to swift societal changes. As the pace of change in society continues to accelerate, these challenges within the policymaking framework are becoming more evident, highlighting a significant concern about their current effectiveness and future readiness";

  memory.customInstructions.rankSubProblems = `
    1. Assess how important the sub problems are as sub problems to the main problem statement.
    2. We are not looking for solutions, only well defined sub problems.
    3. Keep in mind while you decide that the sub problems, in this case, are especially important to civil soecity and policymakers.
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
 3. Remember that the main facilitator for implementation will be governments.
   4. Frame solution components with the intention of convincing politicians and governments to put them into action.
   5. The solution component title should indicate the benefits or results of implementing the solution component.
   6. Avoid blockchain solution components or solution components involving commercial products.`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be included in larger policy recommendations to governments around the world.
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
        benefitsForPolicitians,
        benefitsForPrivateSector,
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

const setupProjectSeven = (memory: PsSmarterCrowdsourcingMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  /* BATCH A
  memory.problemStatement.description = `There is an urgent need to better understand the impact of artificial intelligence (AI) on New Jersey's workforce and economy.
  Here are wide categories we want to understand in this research in regards to whether and how AI-driven changes in New Jersey may:
    Lead to job displacement and economic instability
    Create barriers to economic growth
    Affect the demand for skills
    Transform employment opportunities in New Jersey`;*/

  /* BATCH B
  memory.problemStatement.description = `There is an urgent need to better understand the impact of artificial intelligence (AI) on New Jersey's workforce and economy.
    Here are wide categories we want to understand in this research in regards to whether and how AI-driven changes in New Jersey may:
      Erode workers’ privacy and autonomy
      Create biases in talent management
      Weaken workers’ collective power and ability to engage in collective action
      Create new occupational health and safety risks.`;*/

  /* BATCH C */
  memory.problemStatement.description = `The integration of artificial intelligence (AI) into New Jersey's economic and employment landscape necessitates a comprehensive exploration of its widespread impacts.
Understanding how AI-driven changes might reshape workforce dynamics, economic stability, and overall employment structures is crucial. This exploration aims to identify and address both known and unforeseen challenges that AI may introduce to the workforce, economy, and societal norms in New Jersey.`;

  memory.customInstructions.createSubProblems = `Broad challenge of AI-driven job displacement.
  Identify subproblems that specifically reflect the unique demographic, economic, and industrial landscape of New Jersey.
  Consider both immediate and long-term impacts of AI on New Jersey's workforce and other states, including changes in job types, shifts in skill requirements, and the overall economic environment.
  Subproblems should address the priorities and concerns of unions, education and training providers, and businesses, reflecting how AI-driven changes will impact their operations and interests.
  We also want to understand whether AI-driven disruptions will lead to barriers to economic growth in New Jersey's economy.
  Utilize current studies, surveys, and data analyses to ground each subproblem in real, quantifiable trends observed or predicted for New Jersey’s economy.`;

  memory.customInstructions.rankSubProblems = `1. Assess how impactful the sub problems are as sub problems to the main problem statement.
  2. Focus on prioritizing subproblems for further investigation and policy development, rather than proposing immediate solutions
  3. Rank subproblems based on their anticipated economic impact, the number of individuals affected, and the urgency of addressing the issue within the next decade.`;

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

  memory.customInstructions.rootCauseUrlsToScan = [
    "https://www.nber.org/system/files/working_papers/w25682/w25682.pdf",
    "https://economics.mit.edu/sites/default/files/publications/AI%20and%20Jobs%20-%20Evidence%20from%20Online%20Vacancies.pdf",
    "https://repec.cepr.org/repec/cpr/ceprdp/DP16868.pdf",
    "https://deliverypdf.ssrn.com/delivery.php?ID=087089099092099124006017125005114005018043040037001065095010008113091096108026088067002010036056019123016101096007090104079016104087070023007099017025078029016116090000078039007121081112125123070121099081106099073019127027087067065009015080076098098103&EXT=pdf&INDEX=TRUE",
    "https://scholar.harvard.edu/files/lkatz/files/adkpv-superstars-qje-manuscript-accepted-20191028.pdf",
    "https://www.nber.org/system/files/working_papers/w20485/w20485.pdf",
    "https://www.sciencedirect.com/science/article/abs/pii/S0304407621003018",
    "https://www.congress.gov/116/meeting/house/109981/witnesses/HHRG-116-SY15-Wstate-BrynjolfssonE-20190924.pdf",
    "https://direct.mit.edu/daed/article/151/2/272/110622/The-Turing-Trap-The-Promise-amp-Peril-of-Human",
    "https://www.hoover.org/research/how-will-machine-learning-transform-labor-market",
    "https://canvas.stanford.edu/files/5454842/download?download_frd=1",
    "https://www.aeaweb.org/articles?id=10.1257/pandp.20181019",
    "https://academic.oup.com/oxrep/article/36/4/903/6124297",
    "https://www.tandfonline.com/doi/full/10.1080/13504851.2021.2024129",
    "https://www.mckinsey.com/~/media/mckinsey/mckinsey%20global%20institute/our%20research/generative%20ai%20and%20the%20future%20of%20work%20in%20america/generative-ai-and-the-future-of-work-in-america-vf1.pdf",
    "https://onlinelibrary.wiley.com/doi/full/10.1002/smj.3286",
    "https://www.pnas.org/doi/10.1073/pnas.1900949116",
    "https://docs.iza.org/dp14649.pdf",
    "https://www.brookings.edu/wp-content/uploads/2022/05/Learning-and-working-in-the-digital-age_FINAL.pdf",
    "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4081625",
    "https://ecai2020.eu/papers/1009_paper.pdf",
    "https://mackinstitute.wharton.upenn.edu/wp-content/uploads/2022/03/McElheran-Kristina-et-al._AI-Adoption-in-America.pdf",
    "https://www.nber.org/system/files/working_papers/w28285/w28285.pdf",
    "https://www.jair.org/index.php/jair/article/view/12647/26688",
    "https://www.michaelwebb.co/webb_ai.pdf",
    "https://www.whitehouse.gov/cea/written-materials/2022/12/05/the-impact-of-artificial-intelligence/",
    "https://webapps.ilo.org/static/english/intserv/working-papers/wp096/index.html",
    "https://heldrich.rutgers.edu/sites/default/files/2024-02/Work_Trends_February_2024.pdf",
    "https://www.pewresearch.org/short-reads/2023/11/21/what-the-data-says-about-americans-views-of-artificial-intelligence/",
    "https://economicgraph.linkedin.com/research/future-of-work-report-ai",
    "https://www3.weforum.org/docs/WEF_Future_of_Jobs_2020.pdf",
  ];

  memory.customInstructions.createSolutions = `
   1. Never create solution components in the form of frameworks or holistic approaches
   2. Solution components should include only one core idea
   3. Remember that the main facilitator for implementation will be governments.
   4. Frame solution components with the intention of convincing politicians and governments to put them into action.
   5. The solution component title should indicate the benefits or results of implementing the solution component.
   6. Avoid blockchain solution components or solution components involving commercial products.`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be included in larger policy recommendations to governments around the world.
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
        benefitsForPolicitians,
        benefitsForPrivateSector,
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

const setupProjectEight = (memory: PsSmarterCrowdsourcingMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.problemStatement.description = `The dropout rate among young men aged 18-24 from education and vocational training in Iceland has reached 20% and is accelerating. In comparison, Norway has the second-highest rate among Nordic countries at 14%. What are the potential causes of this trend?`;

  memory.customInstructions.createSubProblems = undefined;

  memory.customInstructions.rankSubProblems = `1. Assess how impactful the sub problems are as sub problems to the main problem statement.
  2. Focus on prioritizing subproblems for further investigation and policy development, rather than proposing immediate solutions
  3. Rank subproblems based on their anticipated impact on young men.`;

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

  memory.customInstructions.rootCauseUrlsToScan = [];

  memory.customInstructions.createSolutions = `
   1. Never create solution components in the form of frameworks or holistic approaches
   2. Solution components should include only one core idea
   3. Remember that the main facilitator for implementation will be governments.
   4. Frame solution components with the intention of convincing politicians and governments to put them into action.
   5. The solution component title should indicate the benefits or results of implementing the solution component.
   6. Avoid blockchain solution components or solution components involving commercial products.`;

  memory.customInstructions.rankSolutions = `
    1. Solution components will be included in larger policy recommendations to governments around the world.
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
        benefitsForPolicitians,
        benefitsForPrivateSector,
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

const setupProjectNine = (memory: PsSmarterCrowdsourcingMemoryData) => {
  if (!memory.customInstructions) {
    memory.customInstructions = {} as any;
  }

  memory.problemStatement.description = `The Menntasjóður námsmanna law (nr. 60/2020) encounters significant issues, including underutilization of educational grants, high administrative costs, and student dissatisfaction with progress requirements and loan conditions. Additionally, the low application and completion rates for higher education, along with extended graduation times, exacerbate the challenges.`;

  memory.customInstructions.createSubProblems = undefined;

  memory.customInstructions.rankSubProblems = `1. Assess how impactful the sub problems are as sub problems to the main problem statement.
  2. Rank subproblems based on their anticipated impact.`;

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

  memory.customInstructions.rootCauseUrlsToScan = [
    "https://student.is/static/28417e3343f2547873744732eeab15e9/Aherslur-Studentarads-i-tengslum-vid-endurskodun-laga-um-Menntasjod-namsmanna-nr.-60_2020-.pdf",
    "https://www.althingi.is/altext/pdf/154/fylgiskjol/s0765-f_I.pdf"
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
   3. Remember that the main facilitator for implementation will be governments.
   4. Frame solution components with the intention of convincing politicians and governments to put them into action.
   5. The solution component title should indicate the benefits or results of implementing the solution component.
   6. Avoid blockchain solution components or solution components involving commercial products.`;

  memory.customInstructions.rankSolutions = `
    1. Solutions that are feasible and have a high impact.
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
        benefitsForPolicitians,
        benefitsForPrivateSector,
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

//TODO: Make this database driven
const projectId = process.argv[2];
if (projectId) {
  const redisKey = `st_mem:${projectId}:id`;
  const output = await redis.get(redisKey);

  const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

  if (projectId == "1") {
    setupProjectOne(memory);
  } else if (projectId == "2") {
    setupProjectTwo(memory);
  } else if (projectId == "3") {
    setupProjectThree(memory);
  } else if (projectId == "4") {
    setupProjectFour(memory);
  } else if (projectId == "5") {
    setupProjectFive(memory);
  } else if (projectId == "6") {
    setupProjectSix(memory);
  } else if (projectId == "7") {
    setupProjectSeven(memory);
  } else if (projectId == "8") {
    setupProjectEight(memory);
  } else if (projectId == "9") {
    setupProjectNine(memory);
  }

  await redis.set(redisKey, JSON.stringify(memory));

  console.log("After saving");

  process.exit(0);
} else {
  console.log("No project id provided - set alignment statements");
  process.exit(1);
}
