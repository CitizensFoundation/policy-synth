import path from "path";
import express from 'express';
import { fileURLToPath } from 'url';
import { PolicySynthApiApp } from '@policysynth/api/app.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class EcasYeaServerApi extends PolicySynthApiApp {
    setupStaticPaths() {
        console.log("Setting up static paths");
        console.log(`__dirname: ${__dirname}`);
        this.app.use(express.static(path.join(__dirname, "../webApp/dist")));
        this.app.use("/chat*", express.static(path.join(__dirname, "../webApp/dist")));
    }
}
//# sourceMappingURL=app.js.map