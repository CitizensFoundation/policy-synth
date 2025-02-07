import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
export class PsEngineerProgrammingBuildAgent extends PsEngineerBaseProgrammingAgent {
    async build() {
        console.log(`Starting build process in ${this.memory.workspaceFolder}`);
        try {
            const { stdout, stderr } = await execPromise("npm run build", {
                cwd: this.memory.workspaceFolder,
            });
            console.log("Build output:", stdout);
            // Check stderr even if exit code is 0; these might be warnings.
            if (stderr) {
                // You might want to add additional logic here to decide if these are critical warnings.
                console.warn("Build warnings (non-fatal):", stderr);
                this.memory.allBuildWarnings = this.memory.allBuildWarnings || [];
                this.memory.allBuildWarnings.push(stderr);
                await this.saveMemory();
            }
            // Return undefined to indicate the build succeeded.
            return undefined;
        }
        catch (error) {
            console.error("Error during the build process:", error);
            // Log the actual build error.
            this.memory.allBuildErrors.push(`${error.message}\nAttempted build output:\n${error.stdout}`);
            await this.saveMemory();
            return `Error during the build process: ${error.message}\nAttempted build output:\n${error.stdout}`;
        }
    }
}
//# sourceMappingURL=buildAgent.js.map