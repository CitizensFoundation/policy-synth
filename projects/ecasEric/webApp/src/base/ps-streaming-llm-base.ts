import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element.js";
import { property } from "lit/decorators.js";

export abstract class PsStreamingLlmBase extends YpBaseElement {
  @property({ type: Array })
  chatLog: PsAiChatWsMessage[] = [];

  @property({ type: String })
  wsClientId!: string;

  @property({ type: Number })
  webSocketsErrorCount = 0;

  @property({ type: String })
  wsEndpoint!: string;

  @property({ type: String })
  currentFollowUpQuestions: string = "";

  @property({ type: Boolean })
  programmaticScroll = false;

  @property({ type: Boolean })
  disableAutoScroll = false;

  @property({ type: Number })
  scrollStart: number = 0;

  @property({ type: String })
  serverMemoryId: string | undefined;

  // Keeping an instance property for interface compatibility.
  // (This value will be used from the first subscriber when creating the connection.)
  @property({ type: Number })
  defaultDevWsPort = 4242;

  // An instance flag so that an element can opt out of receiving socket events.
  disableWebsockets = false;

  // ----------------- Static Shared WebSocket & State -------------------
  private static ws: WebSocket | null = null;
  private static subscribers: Set<PsStreamingLlmBase> = new Set();

  private static reconnectDelay: number = 1000;
  private static reconnectionAttempts: number = 1;
  private static reconnectTimer: number | undefined;
  private static wsManuallyClosed: boolean = false;

  protected get ws(): WebSocket | null {
    // This returns the static WebSocket from the class constructor
    return (this.constructor as typeof PsStreamingLlmBase).ws;
  }
  protected set ws(value: WebSocket | null) {
    (this.constructor as typeof PsStreamingLlmBase).ws = value;
  }

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.disableWebsockets) {
      // Add this instance to the list of subscribers
      PsStreamingLlmBase.subscribers.add(this);
      // If no shared connection exists or if it’s closed, create a new one.
      if (
        !PsStreamingLlmBase.ws ||
        PsStreamingLlmBase.ws.readyState === WebSocket.CLOSED
      ) {
        PsStreamingLlmBase.initWebSocketsStatic(this);
      }
    }
  }

  /**
   * Initializes the shared WebSocket connection.
   * Uses the defaultDevWsPort from the provided instance (or first subscriber) for the URL.
   */
  private static initWebSocketsStatic(instance?: PsStreamingLlmBase) {
    let defaultPort = 9080;
    if (instance) {
      defaultPort = instance.defaultDevWsPort;
    } else if (PsStreamingLlmBase.subscribers.size > 0) {
      const firstSub = PsStreamingLlmBase.subscribers.values().next().value;
      if (firstSub) {
        defaultPort = firstSub.defaultDevWsPort;
      }
    }

    const storedClientId = localStorage.getItem("ypWsClientId") || "";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Use port 443 for wss, or the defaultPort for ws.
    const port = protocol === "wss:" ? 443 : defaultPort;
    const endpoint = `${protocol}//${window.location.hostname}${
      port ? ":" + port : ""
    }/ws${storedClientId ? "?clientId=" + storedClientId : ""}`;

    // Reset the manually closed flag (if we’re reconnecting)
    PsStreamingLlmBase.wsManuallyClosed = false;
    PsStreamingLlmBase.ws = new WebSocket(endpoint);
    console.log("Attempting to connect to", endpoint);

    PsStreamingLlmBase.ws.onopen = () => {
      console.log("WebSocket open");
      // Reset reconnect parameters on a successful connection.
      PsStreamingLlmBase.reconnectDelay = 1000;
      PsStreamingLlmBase.reconnectionAttempts = 1;

      window.dispatchEvent(new Event("wsConnected"));
    };

    PsStreamingLlmBase.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update the clientId if the server provides one, and notify all subscribers.
      if (data.clientId) {
        console.log("Received clientId from server:", data.clientId);
        localStorage.setItem("ypWsClientId", data.clientId);
        PsStreamingLlmBase.subscribers.forEach((sub) => {
          sub.wsClientId = data.clientId;
        });
      }

      // Dispatch the event to every subscriber’s onMessage method.
      PsStreamingLlmBase.subscribers.forEach((sub) => {
        sub.onMessage(event);
      });
    };

    PsStreamingLlmBase.ws.onclose = (ev) => {
      console.warn("WebSocket closed:", ev.reason);
      PsStreamingLlmBase.scheduleReconnect();
    };

    PsStreamingLlmBase.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      PsStreamingLlmBase.scheduleReconnect();
    };
  }

   static scheduleReconnect(doItNow = false) {
    // Do not attempt to reconnect if the socket was manually closed.
    if (PsStreamingLlmBase.wsManuallyClosed) return;

    if (PsStreamingLlmBase.reconnectTimer) {
      window.clearTimeout(PsStreamingLlmBase.reconnectTimer);
    }
    PsStreamingLlmBase.reconnectTimer = window.setTimeout(() => {
      console.log("Reconnecting...");
      PsStreamingLlmBase.initWebSocketsStatic();
      PsStreamingLlmBase.reconnectDelay = Math.min(
        PsStreamingLlmBase.reconnectDelay *
          PsStreamingLlmBase.reconnectionAttempts,
        5000
      );
      PsStreamingLlmBase.reconnectionAttempts++;
    }, doItNow ? 0 : PsStreamingLlmBase.reconnectDelay);
  }

  public sendClientMessage(payload: string) {
    console.info("Sending client message");
    if (
      PsStreamingLlmBase.ws &&
      PsStreamingLlmBase.ws.readyState === WebSocket.OPEN
    ) {
      PsStreamingLlmBase.ws.send(payload);
    } else {
      console.error("WebSocket not open; cannot send message");
      if (PsStreamingLlmBase.ws?.readyState !== WebSocket.CONNECTING) {
        PsStreamingLlmBase.scheduleReconnect();
      }
    }
  }

  public sendMessage(action: string, payload: any) {
    console.info("Sending message");
    if (
      PsStreamingLlmBase.ws &&
      PsStreamingLlmBase.ws.readyState === WebSocket.OPEN
    ) {
      PsStreamingLlmBase.ws.send(
        JSON.stringify({
          clientId: this.wsClientId,
          action,
          payload,
        })
      );
    } else {
      console.error("WebSocket not open; cannot send message");
      if (PsStreamingLlmBase.ws?.readyState !== WebSocket.CONNECTING) {
        PsStreamingLlmBase.scheduleReconnect();
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    console.info(
      "Disconnected callback called, clearing heartbeat intervals and reconnect timer"
    );

    if (PsStreamingLlmBase.reconnectTimer) {
      clearTimeout(PsStreamingLlmBase.reconnectTimer);
    }

    // Remove this instance from the subscribers.
    PsStreamingLlmBase.subscribers.delete(this);

    // If no instances remain, close the shared connection.
    if (PsStreamingLlmBase.subscribers.size === 0 && PsStreamingLlmBase.ws) {
      PsStreamingLlmBase.wsManuallyClosed = true;
      PsStreamingLlmBase.ws.close();
    }
  }

  async onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);

    // Process messages as before
    switch (data.sender) {
      case "assistant":
        await this.addChatBotElement(data);
        break;
      case "user":
        this.addChatUserElement(data);
        break;
    }

    if (
      data.type !== "stream_followup" &&
      data.type !== "voice_input" &&
      data.type !== "updated_workflow" &&
      data.type !== "heartbeat_ack" &&
      data.type !== "hiddenContextMessage"
    ) {
      this.scrollDown();
    }
  }

  abstract scrollDown(): void;

  addUserChatBotMessage(userMessage: string) {
    this.addChatBotElement({
      sender: "user",
      type: "start",
      message: userMessage,
    });
  }

  addThinkingChatBotMessage() {
    this.addChatBotElement({
      sender: "assistant",
      type: "thinking",
      message: "",
    });
  }

  abstract addChatBotElement(wsMessage: PsAiChatWsMessage): Promise<void>;

  addChatUserElement(data: PsAiChatWsMessage) {
    this.chatLog = [...this.chatLog, data];
  }

  get simplifiedChatLog() {
    let chatLog = this.chatLog.filter(
      (chatMessage) =>
        chatMessage.type !== "thinking" &&
        chatMessage.type !== "noStreaming" &&
        chatMessage.sender !== "system"
    );
    return chatLog.map((chatMessage) => {
      return {
        ...chatMessage,
        message: chatMessage.rawMessage
          ? chatMessage.rawMessage
          : chatMessage.message,
      };
    }) as PsSimpleChatLog[];
  }

  reset() {
    this.chatLog = [];
    if (PsStreamingLlmBase.ws) {
      PsStreamingLlmBase.ws.close();
      // Clear the static socket so it can be re-established.
      PsStreamingLlmBase.ws = null;
      if (PsStreamingLlmBase.subscribers.size > 0) {
        PsStreamingLlmBase.initWebSocketsStatic();
      }
    }
    this.serverMemoryId = undefined;
    this.requestUpdate();
  }
}
