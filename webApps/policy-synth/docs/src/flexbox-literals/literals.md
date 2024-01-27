# Flexbox Literals

This module provides a collection of CSS template literals for common flexbox and layout styles using the `lit` library's `css` tagged template function. These styles are designed to be easily imported and used in LitElement components to apply flexbox layouts and other common CSS properties.

## Properties

| Name                  | Type   | Description                                           |
|-----------------------|--------|-------------------------------------------------------|
| displayFlex           | CSSResult | Applies standard flexbox display.                     |
| borderBox             | CSSResult | Sets the box-sizing to border-box.                    |
| displayInlineFlex     | CSSResult | Applies inline-flexbox display.                       |
| horizontal            | CSSResult | Sets flex items to lay out horizontally.              |
| vertical              | CSSResult | Sets flex items to lay out vertically.                |
| wrap                  | CSSResult | Allows flex items to wrap onto multiple lines.        |
| noWrap                | CSSResult | Prevents flex items from wrapping.                    |
| flexFactor            | CSSResult | Sets flex grow, shrink, and basis properties.         |
| flexFactorAuto        | CSSResult | Sets flex properties to auto.                         |
| flexFactorNone        | CSSResult | Sets flex properties to none.                         |
| displayNone           | CSSResult | Applies display none with importance.                 |
| flex2 to flex12       | CSSResult | Sets the flex grow property from 2 to 12.             |
| horizontalReverse     | CSSResult | Lays out flex items horizontally in reverse.          |
| verticalReverse       | CSSResult | Lays out flex items vertically in reverse.            |
| wrapReverse           | CSSResult | Allows flex items to wrap in reverse order.           |
| displayBlock          | CSSResult | Applies block display.                                |
| invisible             | CSSResult | Makes an element invisible but still occupies space.  |
| relative              | CSSResult | Sets the position to relative.                        |
| fit                   | CSSResult | Absolutely positions an element to fit its container. |
| scroll                | CSSResult | Applies auto overflow with touch scrolling.           |
| fixed                 | CSSResult | Sets the position to fixed.                           |
| fixedTop              | CSSResult | Fixes an element to the top of the viewport.          |
| fixedRight            | CSSResult | Fixes an element to the right of the viewport.        |
| fixedLeft             | CSSResult | Fixes an element to the left of the viewport.         |
| fixedBottom           | CSSResult | Fixes an element to the bottom of the viewport.       |
| startAligned to endAligned | CSSResult | Aligns items from start to end.                      |
| baseline              | CSSResult | Aligns items based on their baseline.                 |
| startJustified to aroundJustified | CSSResult | Justifies content from start to space-around.       |
| selfStart to selfBaseline | CSSResult | Aligns self from start to baseline.                  |
| startAlignedContent to aroundAlignedContent | CSSResult | Aligns content from start to space-around.         |

## Example

```typescript
import { css } from 'lit';
import { displayFlex, vertical, wrap } from '@policysynth/webapp/flexbox-literals/literals.js';

const myElementStyles = css`
  ${displayFlex}
  ${vertical}
  ${wrap}
`;
```

This example demonstrates how to import and use the flexbox literals in a LitElement component to apply a vertical, wrapping flexbox layout.