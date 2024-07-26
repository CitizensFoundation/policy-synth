import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import { PsStageBase } from '../base/ps-stage-base.js';
import { LtpServerApi } from './LtpServerApi.js';
import { LtpCurrentRealityTree } from './ltp-current-reality-tree.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { YpCodeBase } from '@yrpri/webapp/common/YpCodeBaseclass.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

export class LtpStreamingAIResponse extends YpCodeBase {
  wsClientId!: string;

  targetContainer: HTMLElement | HTMLInputElement | undefined;

  caller: YpBaseElement;

  api: LtpServerApi;

  ws!: WebSocket;

  isActive = false;

  constructor(
    caller: YpBaseElement,
    targetContainer: HTMLElement | HTMLInputElement | undefined = undefined
  ) {
    super();
    this.caller = caller;
    this.api = new LtpServerApi();
    this.targetContainer = targetContainer;
  }

  close() {
    this.ws.close();
    this.isActive = false;
  }

  async connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      let wsEndpoint;
      this.isActive = true;

      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '192.1.168'
      ) {
        wsEndpoint = `ws://${window.location.hostname}:8000`;
      } else {
        wsEndpoint = `wss://${window.location.hostname}:443`;
      }

      this.ws = new WebSocket(wsEndpoint);

      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onopen = event => {
        this.onWsOpen(event, resolve);
      };
      this.ws.onerror = reject; // Handle connection errors
    });
  }

  onWsOpen(event: Event, resolve: (wsClientId: string) => void) {
    // Assuming the server sends the clientId immediately after connection
    this.ws.onmessage = messageEvent => {
      const data = JSON.parse(messageEvent.data);
      if (data.clientId) {
        this.wsClientId = data.clientId;
        resolve(this.wsClientId); // Resolve the promise with the clientId
        this.ws.onmessage = this.onMessage.bind(this); // Reset the onmessage handler
      }
    };
  }

  onMessage(event: MessageEvent) {
    if (!this.isActive) return;

    const data = JSON.parse(event.data);

    if (data.type === 'part') {
      if (this.targetContainer) {
        this.targetContainer.innerHTML += data.text;
      }
    }
    this.caller.fire('wsMessage', { data, wsClientId: this.wsClientId });
  }
}
