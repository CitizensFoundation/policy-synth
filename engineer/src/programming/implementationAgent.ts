import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";

import {
  ClassDeclaration,
  FunctionDeclarationStructure,
  Project,
  SourceFile,
} from "ts-morph";

import fs from "fs";
import path from "path";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";

export class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
  actionPlan!: PsEngineerCodingActionPlanItem[];
  havePrintedFirstUserDebugMessage = false;

  get codingSystemPrompt() {
    return `Your are an expert software engineering programmer.

      Instructions:
      1. Review the task name, description and general instructions.
      2. Review the documentation, examples, code and typedefs.
      3. Use the provided coding plan to implement the changes.

      Output:
      1. Always output the full changed typescript file, do not leave anyything out.
      2. Output nothing else than the change typescript file.
      3. Use markdown typescript for output.
`;
  }

  codingUserPrompt(
    action: PsEngineerCodingActionPlanItem,
    curentFileToUpdateContents: string | undefined
  ) {
    return `<ContextFromOnlineSearch>${
      this.memory.exampleContextItems &&
      this.memory.exampleContextItems.length > 0
        ? `Potentally relevant code examples from web search:
    ${this.memory.exampleContextItems.map((i) => i)}`
        : ``
    }
    ${
      this.memory.docsContextItems && this.memory.docsContextItems.length > 0
        ? `Potentally relevant documentation from a web search:
    ${this.memory.docsContextItems.map((i) => i)}`
        : ``
    }

    ${this.renderDefaultTaskAndContext()}

    Full Overall Action Plan:

    Your Action/Task now:
    ${JSON.stringify(action, null, 2)}

    ${
      curentFileToUpdateContents
        ? `Current file your are changing:\n${action.fullPathToNewOrUpdatedFile}:\n${curentFileToUpdateContents}`
        : ``
    }

    Output the ${action.fileAction == "change" ? "changed " : "new"} file ${
      action.fileAction == "change" ? "again " : ""
    }in typescript:
    `;
  }

  async implementAction(action: PsEngineerCodingActionPlanItem) {
    console.log(`Working on file: ${action.fullPathToNewOrUpdatedFile}`);
    console.log(JSON.stringify(action, null, 2));
    let curentFileToUpdateContents: string | undefined;
    if (action.fileAction === "change") {
      curentFileToUpdateContents =
        this.loadFileContents(action.fullPathToNewOrUpdatedFile) || "";
    }
    if (!this.havePrintedFirstUserDebugMessage) {
      console.log(
        `Code user prompt:\n${this.codingUserPrompt(
          action,
          curentFileToUpdateContents
        )}\n\n`
      );
      this.havePrintedFirstUserDebugMessage = true;
    }
    const newCode = await this.callLLM(
      "engineering-agent",
      IEngineConstants.engineerModel,
      [
        new SystemMessage(this.codingSystemPrompt),
        new HumanMessage(
          this.codingUserPrompt(action, curentFileToUpdateContents)
        ),
      ],
      false
    );

    console.log(`-------------------> New code:\n${newCode}\n\n`);

    return newCode as string;
  }

  sortActionPlan(actionPlan: PsEngineerCodingActionPlanItem[]) {
    actionPlan.sort((a, b) => {
      if (a.fileAction === "add" && b.fileAction !== "add") {
        return -1;
      } else if (a.fileAction !== "add" && b.fileAction === "add") {
        return 1;
      } else if (a.fileAction === "change" && b.fileAction === "change") {
        return -1;
      } else if (a.fileAction === "delete" && b.fileAction === "delete") {
        return 1;
      } else {
        return 0;
      }
    });
  }

  async implementCodingActionPlan(
    actionPlan: PsEngineerCodingActionPlanItem[]
  ) {
    this.actionPlan = actionPlan;
    this.sortActionPlan(this.actionPlan);
    for (const action of actionPlan) {
      action.status = "inProgress";
      console.log(`Implementing action: ${JSON.stringify(action, null, 2)}`);
      await this.implementAction(action);
      action.status = "completed";
    }
  }

  deleteDependency(dependencyName: string) {
    console.log(`NOT IMPLEMENTED: Deleted dependency: ${dependencyName}`);
  }

  changeDependency(dependencyName: string, version: string) {
    console.log(
      `NOT IMPLEMENTED: Changed dependency ${dependencyName} to version ${version}`
    );
  }
}
