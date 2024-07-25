import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
export declare class PsEntities extends PsStageBase {
    activeEntityIndex: number | null;
    maxNumberOfTopEntities: number;
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit").TemplateResult<1>;
    renderSubProblemScreen(subProblem: PsSubProblem): import("lit").TemplateResult<1>;
    renderEntityScreen(entity: PsAffectedEntity): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-entities.d.ts.map