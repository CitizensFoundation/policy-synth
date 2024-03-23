import path from "path";
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { PolicySynthApiApp } from '@policysynth/api/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class RebootingDemocracyServerApi extends PolicySynthApiApp {

}
