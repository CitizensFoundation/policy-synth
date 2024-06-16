import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from './base/ps-stage-base.js';
export declare class PsHome extends PsStageBase {
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    disconnectedCallback(): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    renderProject(project: PsProjectData): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-home.d.ts.map