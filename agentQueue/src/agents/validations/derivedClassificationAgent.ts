import { PsClassificationAgent } from "./classificationAgent.js";

export class PsDerivedClassificationAgent extends PsClassificationAgent {
  async classify(input: string) {

    return {
      classification: 'defaultClassification',
      validationErrors: undefined
    };
  }
}
