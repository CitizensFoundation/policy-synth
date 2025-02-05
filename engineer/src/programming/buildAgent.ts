import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export class PsEngineerProgrammingBuildAgent extends PsEngineerBaseProgrammingAgent {
  async build(): Promise<string | undefined> {
    console.log(`Starting build process in ${this.memory.workspaceFolder}`);

    try {
      const { stdout, stderr } = await execPromise("npm run build", {
        cwd: this.memory.workspaceFolder,
      });

      console.log("Build output:", stdout);

      if (stderr) {
        console.error("Build errors:", stderr);

        this.memory.allBuildErrors.push(stderr);
        await this.saveMemory();

        return `${stderr}\n${stdout}`;
      }

      return undefined;
    } catch (error: any) {
      console.error("Error during the build process:", error);
      this.memory.allBuildErrors.push(
        `${error.message}\nAttempted build output:\n${error.stdout}`
      );
      await this.saveMemory();
      return `Error during the build process: ${error.message}\nAttempted build output:\n${error.stdout}`;
    }
  }
}
