import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
export declare class PsSubProblems extends PsStageBase {
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit").TemplateResult<1>;
    renderSubProblemScreen(subProblem: PsSubProblem): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-sub-problems.d.ts.map