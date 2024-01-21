# Functions

Functions to handle color scheme generation and application for Material Design.

## Methods

| Name                               | Parameters                                                                                   | Return Type | Description                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| generateMaterialColors             | scheme: DynamicScheme                                                                        | object      | Generates a map of color names to DynamicColor objects based on the provided DynamicScheme.   |
| hctFromHex                         | value: string                                                                                | Hct         | Converts a hex color value to an Hct object representing hue, chroma, and tone.               |
| hexFromHct                         | hue: number, chroma: number, tone: number                                                    | string      | Converts Hct values to a hex color string.                                                    |
| themeFromSourceColorWithContrast   | color: string \| {primary: string, secondary: string, tertiary: string, neutral: string}, isDark: boolean, scheme: Scheme, contrast: number | object      | Creates a color scheme from a source color with specified contrast and scheme type.           |
| themeFromScheme                    | colorScheme: MatScheme                                                                       | object      | Generates a theme object with color properties from a given color scheme.                     |
| applyThemeWithContrast             | doc: DocumentOrShadowRoot, theme: {[name: string]: string}, ssName: string = 'material-theme' | void        | Applies a theme with contrast to a document or shadow root.                                   |
| applyThemeString                   | doc: DocumentOrShadowRoot, themeString: string, ssName: string                               | void        | Applies a theme represented as a CSS string to a document or shadow root.                     |

# Scheme

Type representing various color scheme options.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| Scheme        | 'tonal' \| 'vibrant' \| 'expressive' \| 'content' \| 'neutral' \| 'monochrome' \| 'fidelity' \| 'dynamic' | Enumerated type representing different color scheme options. |

## Examples

```typescript
// Example usage of generating a material color scheme
const colorScheme = themeFromSourceColorWithContrast('#6200EE', false, 'vibrant', 1.1);
const theme = themeFromScheme(colorScheme);
applyThemeWithContrast(document, theme);
```

```typescript
// Example usage of converting hex to Hct and back
const hctColor = hctFromHex('#6200EE');
const hexColor = hexFromHct(hctColor.hue, hctColor.chroma, hctColor.tone);
```