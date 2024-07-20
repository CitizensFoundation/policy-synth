import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
export declare class PsWebResearch extends PsStageBase {
    maxNumberOfTopEntities: number;
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit").TemplateResult<1>;
    renderEntities(subProblem: PsSubProblem): import("lit").TemplateResult<1>;
    renderSubProblemsWithAll(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-web-research.d.ts.map