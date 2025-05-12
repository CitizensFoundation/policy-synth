
import { YpAppGlobals } from '@yrpri/webapp/yp-app/YpAppGlobals.js';
import { PsServerApi } from './PsServerApi.js';

export class PsAppGlobals extends YpAppGlobals {
  originalQueryParameters: any;
  originalReferrer: string;
  questionId: number;
  earlId: number;
  promptId: number;
  earlName: string;
  disableParentConstruction = true;
  exernalGoalParamsWhiteList: string | undefined;

  agentsInstanceRegistry: Map<number, PsAgentAttributes> = new Map();
  connectorsInstanceRegistry: Map<number, PsAgentConnectorAttributes> = new Map();

  currentRunningAgentId: number | undefined;
  currentAgentListeners: any[] = [];

  constructor(serverApi: PsServerApi) {
    super(serverApi, true);
    this.currentRunningAgentId = undefined;
    this.parseQueryString();
    //this.earlName = this.getEarlName();
    this.originalReferrer = document.referrer;
    document.addEventListener('set-ids' as any, this.setIds.bind(this));
  }

  setCurrentRunningAgentId(id: number | undefined) {
    this.currentRunningAgentId = id;
    this.notifyCurrentAgentListeners();
  }

  addCurrentAgentListener(callback: Function) {
    this.currentAgentListeners.push(callback);
  }

  removeCurrentAgentListener(callback: Function) {
    this.currentAgentListeners = this.currentAgentListeners.filter(listener => listener !== callback);
  }

  notifyCurrentAgentListeners() {
    this.currentAgentListeners.forEach(listener => listener(this.currentRunningAgentId));
  }

  addToAgentsRegistry = (agent: PsAgentAttributes): void => {
    this.agentsInstanceRegistry.set(agent.id, agent);
  }

  addToConnectorsRegistry = (connector: PsAgentConnectorAttributes): void => {
    this.connectorsInstanceRegistry.set(connector.id, connector);
  }

  getAgentInstance(agentId: number): PsAgentAttributes | undefined {
    return this.agentsInstanceRegistry.get(agentId);
  }

  getConnectorInstance(connectorId: number): PsAgentConnectorAttributes | undefined {
    return this.connectorsInstanceRegistry.get(connectorId);
  }

  getEarlName = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('name')) {
      return urlParams.get('name');
    } else {
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments.length >= 2 && pathSegments[1]) {
        return pathSegments[1];
      }
    }

    console.error(
      `Earl name not found in URL or path: ${window.location.href}`
    );
    return null;
  };

  setIds = (e: CustomEvent): void => {
    this.questionId = e.detail.questionId;
    this.earlId = e.detail.earlId;
    this.promptId = e.detail.promptId;
  };

  parseQueryString = (): void => {
    const query = (window.location.search || '?').substr(1);
    let map: { [key: string]: string } = {};

    const re = /([^&=]+)=?([^&]*)(?:&+|$)/g;
    let match;
    while ((match = re.exec(query))) {
      const key = match[1];
      const value = match[2];
      map[key] = value;
    }

    this.originalQueryParameters = map;
  };

  getSessionFromCookie = (): string => {
    const strCookies = document.cookie;
    const cookiearray = strCookies.split(';');
    let sid = '';
    for (let i = 0; i < cookiearray.length; i++) {
      let name = cookiearray[i].split('=')[0];
      let value = cookiearray[i].split('=')[1];
      if (name.trim() === '_all_our_ideas_session') {
        sid = value;
      }
    }
    return sid;
  };

  getOriginalQueryString() {
    if (this.originalQueryParameters) {
      return new URLSearchParams(this.originalQueryParameters).toString();
    } else {
      return null;
    }
  }

  activity = (type: string, object: any | undefined = undefined): void => {
    let actor: string;

    if (window.appUser && window.appUser.user) {
      //actor = window.appUser.user.id;
    } else {
      actor = '-1';
    }

    const date = new Date();
    const body = {
      actor: actor,
      type: type,
      object: object,
      path_name: location.pathname,
      event_time: date.toISOString(),
      session_id: this.getSessionFromCookie(),
      originalQueryString: this.getOriginalQueryString(),
      originalReferrer: this.originalReferrer,
      questionId: this.questionId,
      earlId: this.earlId,
      promptId: this.promptId,
      earlName: this.earlName,
      userLocale: window.locale,
      userAutoTranslate: window.autoTranslate,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      url: location.href,
      screen_width: window.innerWidth,
    };

    //@ts-ignore
    if (typeof gtag == 'function') {
      //@ts-ignore
      gtag('event', type)
    }

    try {
      fetch('/api/analytics/createActivityFromApp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then(response => {
          if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
          } else {
            if (
              type === 'Voting - left' ||
              type === 'Voting - right' ||
              type === 'New Idea - added'
            ) {
              this.checkExternalGoalTrigger(type);
            }
          }
        })
        .catch(error => {
          console.error(
            'There has been a problem with your fetch operation:',
            error
          );
        });
    } catch (error) {
      console.error(error);
    }
  };
}
