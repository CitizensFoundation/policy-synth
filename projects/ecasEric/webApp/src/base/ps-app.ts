import { html, nothing, TemplateResult } from "lit";
import { property, customElement, query } from "lit/decorators.js";
import "urlpattern-polyfill";

import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element.js";
import { Layouts } from "@yrpri/webapp/flexbox-literals/classes.js";
import { YpSnackbar } from "@yrpri/webapp/yp-app/yp-snackbar.js";
import "@yrpri/webapp/yp-app/yp-snackbar.js";

import "@material/web/labs/navigationbar/navigation-bar.js";
import "@material/web/labs/navigationtab/navigation-tab.js";
import "@material/web/labs/navigationdrawer/navigation-drawer.js";
import "@material/web/list/list-item.js";
import "@material/web/list/list.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/iconbutton/outlined-icon-button.js";

import {
  applyTheme,
  argbFromHex,
  Scheme,
  themeFromSourceColor,
} from "@material/material-color-utilities";

import "@material/web/menu/menu.js";

import "@yrpri/webapp/common/yp-image.js";

import "@material/web/dialog/dialog.js";
import "@material/web/button/elevated-button.js";
import "@material/web/textfield/outlined-text-field.js";

import { applyThemeWithContrast } from "@yrpri/webapp/common/YpMaterialThemeHelper.js";

import { PsRouter } from "./router/router.js";

import { styles } from "./ps-app.css.js";

@customElement("ps-app")
export class PolicySynthWebApp extends YpBaseElement {
  @property({ type: Object })
  currentMemory: PsAgentMemoryData | undefined;

  @property({ type: Boolean })
  showAllCosts = false;

  @property({ type: String })
  lastSnackbarText: string | undefined;

  @property({ type: String })
  collectionType = "domain";

  @property({ type: String })
  currentError: string | undefined;

  @property({ type: String })
  localStorageThemeColorKey = "lv-theme-color-v2";

  @property({ type: String })
  themeColor = "#df2302";

  @property({ type: String })
  themePrimaryColor = "#000000";

  @property({ type: String })
  themeSecondaryColor = "#000000";

  @property({ type: String })
  themeTertiaryColor = "#000000";

  @property({ type: String })
  themeNeutralColor = "#000000";

  @property({ type: String })
  themeScheme: Scheme = "tonal" as any;

  @property({ type: Boolean })
  themeHighContrast = false;

  @property({ type: Boolean })
  isAdmin = false;

  constructor() {
    super();

    // Set this.themeDarkMode from localStorage or otherwise to true
    const savedDarkMode = localStorage.getItem("lv-dark-mode");
    if (savedDarkMode) {
      this.themeDarkMode = true;
    } else {
      this.themeDarkMode = false;
    }

    const savedHighContrastMode = localStorage.getItem("lv-high-contrast-mode");
    if (savedHighContrastMode) {
      this.themeHighContrast = true;
    } else {
      this.themeHighContrast = false;
    }

    //window.psAppGlobals.activity('pageview');

    this.setupDebugScroll();
  }

  setupDebugScroll() {
    let isScrolling = false;
    let scrollInterval: string | number | NodeJS.Timeout;

    const startScrolling = () => {
      if (!isScrolling) {
        isScrolling = true;
        scrollInterval = setInterval(() => {
          window.scrollBy(0, 1); // Scroll down by 10 pixels
        }, 4); // Every 100 milliseconds
      }
    };

    const stopScrolling = () => {
      if (isScrolling) {
        clearInterval(scrollInterval);
        isScrolling = false;
      }
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "s" && !isScrolling) {
        startScrolling();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "s") {
        stopScrolling();
      }
    });
  }

  router: PsRouter = new PsRouter(
    this,
    [
      {
        path: "/",
        render: () => {
          return html`<ps-home .memory="${this.currentMemory}"></ps-home>`;
        },
      },
    ],
    {
      fallback: {
        render: () => html`<h2>Page not found</h2>`,
      },
    }
  );

  connectedCallback() {
    super.connectedCallback();
    this._setupEventListeners();

    const savedColor = localStorage.getItem(this.localStorageThemeColorKey);
    if (savedColor) {
      this.fireGlobal("lv-theme-color", savedColor);
    }

    this.setupTheme();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  // TODO: Unused
  getHexColor(color: string) {
    if (color) {
      // Replace all # with nothing
      color = color.replace(/#/g, "");
      if (color.length === 6) {
        return `#${color}`;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  themeChanged(target: HTMLElement | undefined = undefined) {
    let themeCss = {} as any;

    // Save this.themeColor to locale storage
    localStorage.setItem(this.localStorageThemeColorKey, this.themeColor);

    const isDark =
      this.themeDarkMode === undefined
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : this.themeDarkMode;

    if (this.isAppleDevice) {
      // TODO: Seeing some cases where this.themeColor is the string "undefined"
      const color =
        !this.themeColor || this.themeColor !== "undefined"
          ? this.themeColor
          : this.themePrimaryColor;

      const theme = themeFromSourceColor(argbFromHex(color || "#000000"), [
        {
          name: "up-vote",
          value: argbFromHex("#0F0"),
          blend: true,
        },
        {
          name: "down-vote",
          value: argbFromHex("#F00"),
          blend: true,
        },
      ]);

      applyTheme(theme, { target: document.body, dark: isDark });
    } else {
      applyThemeWithContrast(document, themeCss);
    }
  }

  snackbarclosed() {
    this.lastSnackbarText = undefined;
  }

  async _displaySnackbar(event: CustomEvent) {
    this.lastSnackbarText = event.detail;
    await this.updateComplete;
    (this.$$("#snackbar") as YpSnackbar).open = true;
  }

  _setupEventListeners() {
    this.addListener("app-error", this._appError);
    this.addListener("display-snackbar", this._displaySnackbar);
    this.addListener("toggle-dark-mode", this.toggleDarkMode.bind(this));
    this.addListener(
      "toggle-high-contrast-mode",
      this.toggleHighContrastMode.bind(this)
    );

    window.addEventListener("popstate", () => {
      //console.error(`pop state ${window.location.pathname}`)
      this.router.goto(window.location.pathname);
      this.requestUpdate();
    });
  }

  _removeEventListeners() {
    this.removeListener("display-snackbar", this._displaySnackbar);
    this.removeListener("app-error", this._appError);
    this.removeListener("toggle-dark-mode", this.toggleDarkMode.bind(this));
    this.removeListener(
      "toggle-high-contrast-mode",
      this.toggleHighContrastMode.bind(this)
    );
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has("themeColor") ||
      changedProperties.has("themeDarkMode")
    ) {
      this.themeChanged();
    }
  }

  _appError(event: CustomEvent) {
    console.error(event.detail.message);
    this.currentError = event.detail.message;
    //(this.$$('#errorDialog') as Dialog).open = true;
  }

  _settingsColorChanged(event: CustomEvent) {
    this.fireGlobal("lv-theme-color", event.detail.value);
  }

  static get styles() {
    return [Layouts, styles];
  }

  updateThemeColor(event: CustomEvent) {
    this.themeColor = event.detail;
  }

  toggleDarkMode() {
    this.themeDarkMode = !this.themeDarkMode;
    if (this.themeDarkMode) {
      //window.psAppGlobals.activity('Settings - dark mode');
      localStorage.setItem("lv-dark-mode", "true");
    } else {
      //window.psAppGlobals.activity('Settings - light mode');
      localStorage.removeItem("lv-dark-mode");
    }
    this.themeChanged();
  }

  toggleHighContrastMode() {
    this.themeHighContrast = !this.themeHighContrast;
    if (this.themeHighContrast) {
      //window.psAppGlobals.activity('Settings - high contrast mode');
      localStorage.setItem("lv-high-contrast-mode", "true");
    } else {
      //window.psAppGlobals.activity('Settings - non high contrast mode');
      localStorage.removeItem("lv-high-contrast-mode");
    }
    this.themeChanged();
  }

  setupTheme() {
    // Read dark mode and theme from localestore and set this.themeDarkMode and this.themeColor and change the theme
    const savedDarkMode = localStorage.getItem("lv-dark-mode");
    if (savedDarkMode) {
      this.themeDarkMode = true;
    } else {
      this.themeDarkMode = false;
    }

    const savedHighContrastMode = localStorage.getItem("lv-high-contrast-mode");

    if (savedHighContrastMode) {
      this.themeHighContrast = true;
    } else {
      this.themeHighContrast = false;
    }

    const savedThemeColor = localStorage.getItem(
      this.localStorageThemeColorKey
    );
    if (savedThemeColor) {
      this.themeColor = savedThemeColor;
    }

    this.fire("lv-theme-dark-mode", this.themeDarkMode);

    this.themeChanged();
  }

  toCamelCase(str: string) {
    return str.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  }

  renderThemeToggle(hideText = false) {
    return html`<div class="layout vertical center-center lightDarkContainer">
        ${!this.themeDarkMode
          ? html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>dark_mode</md-icon></md-outlined-icon-button
              >
            `
          : html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleDarkMode}"
                ><md-icon>light_mode</md-icon></md-outlined-icon-button
              >
            `}
        <div ?hidden="${hideText}">${this.t("Light/Dark")}</div>
      </div>

      <div
        class="layout vertical center-center lightDarkContainer"
        ?hidden="${this.isAppleDevice}"
      >
        ${!this.themeHighContrast
          ? html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleHighContrastMode}"
              ><md-icon>contrast</md-icon></md-outlined-icon-button
            >
          </div> `
          : html`
              <md-outlined-icon-button
                class="darkModeButton"
                @click="${this.toggleHighContrastMode}"
                ><md-icon>contrast_rtl_off</md-icon></md-outlined-icon-button
              >
            `}
        <div ?hidden="${hideText}">${this.t("Contrast")}</div>
      </div>`;
  }

  render() {
    return html`
    ${this.router.outlet()}

    </div>
      ${
        this.lastSnackbarText
          ? html`
              <yp-snackbar
                id="snackbar"
                @MDCSnackbar:closed="${this.snackbarclosed}"
                style="text-align: center;"
                .labelText="${this.lastSnackbarText}"
              ></yp-snackbar>
            `
          : nothing
      }
      `;
  }
}
