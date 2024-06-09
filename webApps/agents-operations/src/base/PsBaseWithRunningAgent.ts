import { property } from "lit/decorators.js";
import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element";

export class PsBaseWithRunningAgentObserver extends YpBaseElement {
  @property({ type: Number })
  currentRunningAgentId: number | undefined = window.psAppGlobals.currentRunningAgentId;

  connectedCallback(): void {
    super.connectedCallback();
    window.psAppGlobals.addCurrentAgentListener(this.handleAgentChange.bind(this));
  }

  disconnectedCallback(): void {
    window.psAppGlobals.removeCurrentAgentListener(this.handleAgentChange.bind(this));
    super.disconnectedCallback();
  }

  handleAgentChange(currentRunningAgentId: number | undefined) {
    this.currentRunningAgentId = currentRunningAgentId;
  }
}

