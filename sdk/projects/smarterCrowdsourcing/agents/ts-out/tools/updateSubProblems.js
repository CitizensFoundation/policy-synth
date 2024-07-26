import ioredis from 'ioredis';
const redis = new ioredis(process.env.REDIS_AGENT_URL || 'redis://localhost:6379');
// Get project id from params
const projectId = process.argv[2];
const loadProject = async () => {
    if (projectId) {
        const output = await redis.get(`st_mem:${projectId}:id`);
        const memory = JSON.parse(output);
        memory.subProblems[1].title = "Misuse of the Legal System";
        memory.subProblems[1].description = "In recent elections, saboteurs have misused the administrative and legal systems in a coordinated effort to obstruct election administration and sow doubt in the outcomes of fair elections in the minds of the public.";
        memory.subProblems[1].whyIsSubProblemImportant = "Frivolous FOIA requests and lawsuits intend to distract election officials from essential election administration duties, disrupt the effective management of electoral operations, obstruct and delay election results, and damage legitimacy and credibility of elections and election outcomes.";
        memory.subProblems[5].title = "Election-related Violence";
        memory.subProblems[5].description = "A free, fair, and vibrant democracy depends on the ability to hold peaceful elections, including running for office, casting, counting and certifying votes free of violence and intimidation. Yet, during recent election cycles, extremist groups and individuals have used violent acts and threats to intimidate political opponents, disrupt electoral processes, and cast doubt on the fairness and legitimacy of election results.";
        memory.subProblems[5].displayDescription = "A free, fair, and vibrant democracy depends on the ability to hold peaceful elections, including running for office, casting, counting and certifying votes free of violence and intimidation.";
        memory.subProblems[5].whyIsSubProblemImportant = "The threat of violence can have a chilling effect that prevents individuals from entering public service and prevents voters from participating in democratic elections. High-profile violent events such as the January 6th insurrection can act as a mobilizing force for extremist movements that cast doubt on the legitimacy of elections.";
        memory.subProblems[6].title = "Democracy and the Role of Journalism";
        memory.subProblems[6].description = "It is a commonplace that a free, fair and critical press is essential to our democracy. However, relentlessly negative, misleading, unrepresentative and harmful press coverage of our elections may, in fact, undermine trust in democratic institutions.";
        memory.subProblems[6].whyIsSubProblemImportant = "The overconsumption of negative news may drive people to disengage from the political system, leading to increased support for extremist movements, authoritarian candidates, and interest in conspiracy theories.";
        await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
        process.exit(0);
    }
    else {
        console.log('No project id provided - update sub problems');
        process.exit(1);
    }
};
loadProject().catch(console.error);
//# sourceMappingURL=updateSubProblems.js.map