import { jsonrepair } from 'jsonrepair';
const toTest = `

{
  "summary": "The text "discusses" four key practices that policy makers can use to maximize their ability to generate effective policy for complex and dynamic environments like Syria.
  These practices include seeing the system in "3-D", engaging with patterns instead of problems, aligning fast and slow variables, and failing smart,
  adapting fast, and leveraging success. The ultimate goal is to produce a more peaceful Syria that improves the quality of life for all Syrians.",
    "relevanceToProblem": "While the text does not directly address the problem statement, it provides valuable insights and strategies for
    policy makers dealing with complex and dynamic environments, which can be applied to the challenge of addressing authoritarians who undermine
    elections and democracy.",
    "mostRelevantParagraphs": [
      "These four practices are each ways to help policy makers see and work with systems as a means of improving our effectiveness. These practices are also predicated on defining the ultimate success of policy in holistic terms – in terms of how it positively impacts the evolution of a social system. The goal of policy in Syria is to produce a more peaceful Syria that improves the quality of life for all Syrians. Success is not just defined in traditional, sectorally-bound ways, e.g., holding an election, reducing battlefield casualties, increasing GDP by a few percentage points, or reducing extreme abuses of human rights. The prize is a better Syria.",
      "How, then, will we know if we are being successful? First, in addition to the immediate on the ground impact of any policy, we will be more successful to the extent that we learn effectively. If we arm the opposition, what did they do with those arms and why? We need to look at both the intended/predicted outcomes and those we did not predict or intend. What impact did these arms transfers have on the regime and why? What does this tell us about key patterns of behavior in Syria and how we can engage with them more effectively? Second, what impact are we having on fast variables (e.g. negotiations, material support, casualties, etc.) and are they building toward changes in slower variables (improved relations among rebel groups, rebuilding infrastructure, building toward a culture of participatory and accountable governance, fostering respect for human rights, improving strained ethnic relations, etc.). Lastly, we should constantly strive to evaluate the process by which we are engaging in Syria and using these four complexity practices: that we are seeing any problem or potential solution in "3-D"; that we are engaging important social patterns, not trying to artificially fix problems; that we distinguish between fast and slow variables and are using fast variables to build toward longer-term goals; and lastly that we know how to fail smart, adapt fast, and leverage our successes."
    ],
    "solutionsIdentifiedInTextContext": [
      "Policy makers should see and work with systems as a means of improving effectiveness",
      "Policy makers should engage with patterns instead of problems",
      "Policy makers should align fast and slow variables",
      "Policy makers should fail smart, adapt fast, and leverage success"
    ],
    "contacts": []
  }
`;
try {
    const parsed = JSON.parse(toTest);
    console.log(parsed);
}
catch (error) {
    console.log(`Error parsing JSON ${toTest}`);
    try {
        console.log(`Trying to repair JSON`);
        // Replace any "<number>-" patterns inside the JSON string with "n-"
        const preprocessed = toTest.replace(/"(\d+)(-[A-Za-z]+)"/g, '$1$2');
        console.log(`Preprocessed JSON: ${preprocessed}`);
        const repaired = jsonrepair(preprocessed);
        const parsed = JSON.parse(repaired);
        console.log(parsed);
        process.exit(0);
    }
    catch (error) {
        console.log(`Error parsing repaired JSON ${toTest}`);
        process.exit(1);
    }
}
//# sourceMappingURL=testJsonRepair.js.map