import '../@yrpri/common/yp-image.js';
import { CpsStageBase } from '../base/cps-stage-base.js';
export declare class CpsSubProblems extends CpsStageBase {
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit-html").TemplateResult<1>;
    renderSubProblemScreen(subProblem: IEngineSubProblem): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=cps-sub-problems.d.ts.map