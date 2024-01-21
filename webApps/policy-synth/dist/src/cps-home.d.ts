import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';
export declare class CpsHome extends CpsStageBase {
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    renderProject(project: PsProjectData): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=cps-home.d.ts.map