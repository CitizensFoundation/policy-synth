import path from "path";
import express from 'express';
import { fileURLToPath } from 'url';
import { PolicySynthApiApp } from '@policysynth/api/app.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export class EcasYeaServerApi extends PolicySynthApiApp {
    setupStaticPaths() {
        this.app.use(express.static(path.join(__dirname, "../webApp/dist")));
        this.app.use("/projects*", express.static(path.join(__dirname, "../webApp/dist")));
    }
}
//# sourceMappingURL=app.js.map