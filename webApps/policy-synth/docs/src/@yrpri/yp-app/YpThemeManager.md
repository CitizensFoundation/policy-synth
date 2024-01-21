# YpThemeManager

The `YpThemeManager` class is responsible for managing themes within an application. It allows for the selection and application of predefined themes, as well as the ability to override theme colors dynamically.

## Properties

| Name           | Type                                                         | Description                                                                 |
|----------------|--------------------------------------------------------------|-----------------------------------------------------------------------------|
| themes         | Array<Record<string, boolean \| string \| Record<string, string>>> | An array of theme objects containing theme properties and values.           |
| selectedTheme  | number \| undefined                                           | The index of the currently selected theme in the `themes` array.            |
| selectedFont   | string \| undefined                                           | The name of the currently selected font.                                    |

## Methods

| Name              | Parameters                                             | Return Type | Description                                                                                   |
|-------------------|--------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| setLoadingStyles  |                                                        | void        | Sets the loading styles for the application.                                                  |
| updateStyles      | properties: Record<string, string>                     | void        | Applies the given style properties to the application.                                        |
| setTheme          | number: number \| undefined, configuration: YpCollectionConfiguration \| undefined | void        | Applies the theme specified by the index or the configuration provided.                       |

## Examples

```typescript
// Example usage of the YpThemeManager class
const themeManager = new YpThemeManager();

// Set a predefined theme by index
themeManager.setTheme(0);

// Set a custom theme using a configuration object
const customThemeConfig = {
  themeOverrideColorPrimary: 'FF0000',
  themeOverrideColorAccent: '00FF00',
  themeOverrideBackgroundColor: '0000FF'
};
themeManager.setTheme(undefined, customThemeConfig);
```

Note: The `YpCollectionConfiguration` type used in the `setTheme` method is not defined within the provided code snippet. It is assumed to be an external type that should be included in the documentation if it is part of the public API.