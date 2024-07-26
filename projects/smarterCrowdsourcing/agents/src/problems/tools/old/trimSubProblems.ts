import { Queue } from "bullmq";
import ioredis from "ioredis";
​
const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);
​
const main = async () => {
  const projectId = process.argv[2];
  const newLength = process.argv[3];
​
  if (projectId) {
    const redisKey = `st_mem:${projectId}:id`;
    const currentProject =  JSON.parse(await redis.get(redisKey) || "") as PsSmarterCrowdsourcingMemoryData;

    /*const newSubProblems = [];
    newSubProblems[0] = currentProject.subProblems[0];
    newSubProblems[1] = currentProject.subProblems[9];
    newSubProblems[2] = currentProject.subProblems[10];
    newSubProblems[3] = currentProject.subProblems[14];
    newSubProblems[4] = currentProject.subProblems[18];
    newSubProblems[5] = currentProject.subProblems[19];
    newSubProblems[6] = currentProject.subProblems[26];

    currentProject.subProblems = newSubProblems;*/

    currentProject.subProblems[0].displayDescription = "Extended graduation times and low completion rates for higher education are exacerbated by the issues within the Menntasjóður námsmanna law (nr. 60/2020).";
    currentProject.subProblems[1].displayDescription = "The new Menntasjóður námsmanna law (nr. 60/2020) replaced G-loans, and types, with H-loans, offering a 30% principal reduction for timely completion.";
    currentProject.subProblems[2].displayDescription = "The Menntasjóður námsmanna law's structure stresses students. Credit requirements for loans and housing, coupled with delayed disbursements, force reliance on short-term bank loans.";
    currentProject.subProblems[3].displayDescription = "The high administrative costs associated with the Menntasjóður námsmanna law indicate significant inefficiencies in the management and distribution of educational grants and loans.";
    currentProject.subProblems[4].displayDescription = "The Menntasjóður námsmanna law (nr. 60/2020) faces significant issues due to its complex and stringent progress requirements and loan conditions, which lead to student dissatisfaction.";
    currentProject.subProblems[5].displayDescription = "High administrative costs associated with the Menntasjóður námsmanna law (nr. 60/2020) can be attributed to the complex regulatory framework and inefficient administrative processes.";
    currentProject.subProblems[6].displayDescription = "The Menntasjóður námsmanna law (nr. 60/2020) faces significant issues due to the high administrative costs associated with managing the educational grants and loans.";
​
    currentProject.subProblems[0].title = "Extended Graduation and Low Completion Rates";
    currentProject.subProblems[4].title = "Stringent Progress and Loan Conditions";
    currentProject.subProblems[5].title = "Complex Regulations and Inefficiency";

    // trim this.memory.subProblems with newLength
    //currentProject.subProblems = currentProject.subProblems.slice(0, parseInt(newLength));
​
    await redis.set(redisKey, JSON.stringify(currentProject));
    console.log("Project trimmed successfully");
    process.exit(0);
  } else {
    console.error("Project id is required");
    process.exit(1);
  }
};
​
main().catch(err => {
  console.error(err);
  process.exit(1);
});