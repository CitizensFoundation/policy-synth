export declare class YpThemeManager {
    themes: Array<Record<string, boolean | string | Record<string, string>>>;
    selectedTheme: number | undefined;
    selectedFont: string | undefined;
    constructor();
    private _setupOverrideTheme;
    setLoadingStyles(): void;
    updateStyles(properties: Record<string, string>): void;
    private _onlyGetStylesFromTheme;
    setTheme(number: number | undefined, configuration?: YpCollectionConfiguration | undefined): void;
}
//# sourceMappingURL=YpThemeManager.d.ts.map