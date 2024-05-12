import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export class PsEngineerProgrammingBuildAgent extends PsEngineerBaseProgrammingAgent {
  async build(): Promise<string | undefined> {
    console.log(`Starting build process in ${this.memory.workspaceFolder}`);

    try {
      const { stdout, stderr } = await execPromise("npm run build", {
        cwd: this.memory.workspaceFolder
      });

      console.log("Build output:", stdout);

      if (stderr) {
        console.error("Build errors:", stderr);
        return stderr;
      }

      return undefined;
    } catch (error) {
      console.error("Error during the build process:", error);
      return error instanceof Error ? error.message : "Unknown error during build";
    }
  }
}
