import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';
export declare class CpsEntities extends CpsStageBase {
    activeEntityIndex: number | null;
    maxNumberOfTopEntities: number;
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    render(): import("lit-html").TemplateResult<1>;
    renderSubProblemScreen(subProblem: IEngineSubProblem): import("lit-html").TemplateResult<1>;
    renderEntityScreen(entity: IEngineAffectedEntity): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=cps-entities.d.ts.map