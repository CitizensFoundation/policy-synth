import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export class PsEngineerProgrammingBuildAgent extends PsEngineerBaseProgrammingAgent {
    async build() {
        console.log(`Implementing changes `);
        // build in console in the this.memory.workspaceFolder
        // detect any errors and if errors return the output from the console
        return undefined;
    }
}
//# sourceMappingURL=buildAgent.js.map