import { css } from "lit";

export const styles = css`
  :host {
    background-color: var(--md-sys-color-background, #fefefe);
  }

  :host {
  }

  a {
    color: var(--md-sys-color-on-surface);
    margin-top: 8px;
  }

  body {
    background-color: var(--md-sys-color-background, #fefefe);
  }

  .analyticsHeaderText {
    font-size: var(--md-sys-typescale-headline-large-size, 18px);
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .appTitleContainer {
    margin-bottom: 0px;
    margin-top: 16px;
    font-family: "Cabin", sans-serif;
    font-size: 22px;
    width: 185px;
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }

  .appTitle {
    padding: 16px;
    margin-left: 4px;
    padding-top: 20px;
  }

  md-outlined-text-field {
    margin: 32px;
  }

  md-elevated-button {
    margin-bottom: 16px;
  }

  .ypLogo {
    margin-top: 16px;
  }

  .rightPanel {
    width: 100%;
  }

  .drawer {
    margin-left: 16px;
    padding-left: 8px;
    margin-right: 16px;
    padding-bottom: 560px;
  }

  .costItem {
    margin-bottom: 8px;
    margin-left: 8px;
    color: var(--md-sys-color-on-surface);
  }

  .statsItem {
    margin-bottom: 6px;
    margin-left: 8px;
    color: var(--md-sys-color-on-surface);
  }

  .statsContainer {
    margin-bottom: 16px;
  }

  .selectedContainer {
    /*--md-list-item-list-item-container-color: var(--md-sys-color-surface-variant);*/
    color: var(--md-sys-color-primary);
    --md-list-item-list-item-label-text-color: var(--md-sys-color-primary);
    --md-list-item-list-item-focus-label-text-color: var(
      --md-sys-color-primary
    );
    --md-list-item-label-text-color: var(--md-sys-color-primary);
  }

  md-navigation-drawer {
    --md-navigation-drawer-container-color: var(--md-sys-color-surface);
  }

  md-list {
    --md-list-container-color: var(--md-sys-color-surface);
  }

  md-navigation-bar {
    --md-navigation-bar-container-color: var(--md-sys-color-surface);
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
  }

  .lightDarkContainer {
    padding-left: 8px;
    padding-right: 8px;
    color: var(--md-sys-color-on-background);
    font-size: 14px;
  }

  .darkModeButton {
    margin: 16px;
  }

  .topAppBar {
    border-radius: 48px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    margin-top: 32px;
    padding: 0px;
    padding-left: 32px;
    padding-right: 32px;
    text-align: center;
  }

  .collectionLogoImage {
    width: 185px;
    height: 104px;
    margin-top: -1px;
  }

  .mainPageContainer {
    margin-top: 16px;
  }

  .version {
    margin: 8px;
    margin-top: 32px;
    font-size: 12px;
    margin-bottom: 32px;
    color: var(--md-sys-color-on-surface);
  }

  .navContainer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 7;
  }

  [hidden] {
    display: none !important;
  }

  md-text-button {
    --md-text-button-label-text-color: #fefefe;
  }

  md-icon-button {
    --md-icon-button-unselected-icon-color: #f0f0f0;
  }

  #goalTriggerSnackbar {
    padding: 24px;
  }

  @media (max-width: 960px) {
    .appTitleContainer {
      margin-top: 32px;
    }
    .mainPageContainer {
      max-width: 100%;
      width: 100%;
      margin-bottom: 96px;
      margin-top: 0;
    }

    prompt-promotion-dashboard {
      max-width: 100%;
    }
  }
`;
