import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';
export declare class CpsWebResearch extends CpsStageBase {
    maxNumberOfTopEntities: number;
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit-html").TemplateResult<1>;
    renderEntities(subProblem: IEngineSubProblem): import("lit-html").TemplateResult<1>;
    renderSubProblemsWithAll(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=cps-web-research.d.ts.map