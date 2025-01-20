   // File: projects/skillsFirst/webResearchTool/agents/src/reviewAgents/readabilityAnalysis-flesch-kincaid.ts

   import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
   import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
   import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
   import { EducationType, EducationTypes } from '../educationTypes.js'; // Adjust the path as needed

   import { fleschKincaid } from 'flesch-kincaid'; // Import the fleschKincaid function
   import {syllable} from 'syllable'; // Package to count syllables
   import sanitizeHtml from 'sanitize-html'; // Import sanitize-html

   // Import necessary types and interfaces
   // import {
   //   JobDescriptionMemoryData,
   //   JobDescription,
   //   JobDescriptionDegreeAnalysis,
   //   DataConsistencyChecks,
   //   DegreeRequirementStatus,
   //   MandatoryStatusExplanations,
   //   ProfessionalLicenseRequirement
   // } from "../types.js";

   export class ReadabilityScoreJobDescriptionAgent extends PolicySynthAgent {
     declare memory: JobDescriptionMemoryData;

     modelSize: PsAiModelSize = PsAiModelSize.Medium;
     override get maxModelTokensOut(): number {
       return 16384;
     }
     override get modelTemperature(): number {
       return 0.0;
     }

     constructor(
       agent: PsAgent,
       memory: JobDescriptionMemoryData,
       startProgress: number,
       endProgress: number
     ) {
       super(agent, memory, startProgress, endProgress);
       this.memory = memory;
     }

     // Processing function for validating job descriptions
     async processJobDescription(jobDescription: JobDescription) {
       await this.updateRangedProgress(
         0,
         `Validating data consistency for ${jobDescription.name}`
       );

       // Ensure degreeAnalysis exists
       jobDescription.degreeAnalysis =
         jobDescription.degreeAnalysis ||
         ({} as JobDescriptionDegreeAnalysis);

       // Existing code for validation checks...
       // [Your existing validation logic goes here]

       // Perform readability analysis
       // Sanitize the text
       const sanitizedText = sanitizeHtml(jobDescription.text, {
         allowedTags: [],       // Remove all HTML tags
         allowedAttributes: {}, // Remove all attributes
       });

       // Replace escape sequences with actual characters
       const text = sanitizedText
         .replace(/\\r\\n|\\n|\\r/g, '\n')
         .replace(/\\t/g, ' ');
       this.logger.info(`words ${text}`)
       // Count words
       const wordsArray = text.match(/\b\w+\b/g) || [];
       const wordCount = wordsArray.length;

       // Count sentences (naive approach)
       const sentenceCount = text.split(/[.?!]+/).filter(Boolean).length;

       // Count syllables
       const syllableCount = syllable(text);

       // Calculate the Flesch-Kincaid Grade Level
       const fleschKincaidGrade = fleschKincaid({
         sentence: sentenceCount,
         word: wordCount,
         syllable: syllableCount,
       });

       // Store the readability analysis results in the jobDescription object
       jobDescription.readabilityAnalysisTextTSNPM = {
         fleschKincaidGrade
       };

       // Continue with the existing code or any further processing
       // [Your existing code continues here]

       await this.updateRangedProgress(
         100,
         "Readability analysis completed with package 'flesch-kincaid'"
       );
     }
   }
