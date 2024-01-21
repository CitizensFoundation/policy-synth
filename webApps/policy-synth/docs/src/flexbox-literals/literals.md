# CSSStyles

This TypeScript file exports a series of constants representing common CSS styles using the `lit` library's `css` tagged template literal. Each constant is a CSS style rule that can be used to style web components.

## Properties

| Name                  | Type   | Description                                           |
|-----------------------|--------|-------------------------------------------------------|
| displayFlex           | CSSResult | CSS for setting an element to display as a flex container. |
| borderBox             | CSSResult | CSS for setting the box-sizing to border-box.         |
| displayInlineFlex     | CSSResult | CSS for setting an element to display as an inline flex container. |
| horizontal            | CSSResult | CSS for setting flex-direction to row.                |
| vertical              | CSSResult | CSS for setting flex-direction to column.             |
| wrap                  | CSSResult | CSS for setting flex-wrap to wrap.                    |
| noWrap                | CSSResult | CSS for setting flex-wrap to nowrap.                  |
| flexFactor            | CSSResult | CSS for setting flex to a default factor with a very small flex-basis. |
| flexFactorAuto        | CSSResult | CSS for setting flex to 1 1 auto.                     |
| flexFactorNone        | CSSResult | CSS for setting flex to none.                         |
| displayNone           | CSSResult | CSS for setting display to none with !important.      |
| flex2                 | CSSResult | CSS for setting flex to 2.                            |
| flex3                 | CSSResult | CSS for setting flex to 3.                            |
| flex4                 | CSSResult | CSS for setting flex to 4.                            |
| flex5                 | CSSResult | CSS for setting flex to 5.                            |
| flex6                 | CSSResult | CSS for setting flex to 6.                            |
| flex7                 | CSSResult | CSS for setting flex to 7.                            |
| flex8                 | CSSResult | CSS for setting flex to 8.                            |
| flex9                 | CSSResult | CSS for setting flex to 9.                            |
| flex10                | CSSResult | CSS for setting flex to 10.                           |
| flex11                | CSSResult | CSS for setting flex to 11.                           |
| flex12                | CSSResult | CSS for setting flex to 12.                           |
| horizontalReverse     | CSSResult | CSS for setting flex-direction to row-reverse.       |
| verticalReverse       | CSSResult | CSS for setting flex-direction to column-reverse.    |
| wrapReverse           | CSSResult | CSS for setting flex-wrap to wrap-reverse.           |
| displayBlock          | CSSResult | CSS for setting display to block.                     |
| invisible             | CSSResult | CSS for setting visibility to hidden with !important. |
| relative              | CSSResult | CSS for setting position to relative.                 |
| fit                   | CSSResult | CSS for setting an element to absolutely position itself to fit its container. |
| scroll                | CSSResult | CSS for setting overflow to auto and touch scrolling behavior for Webkit. |
| fixed                 | CSSResult | CSS for setting position to fixed.                    |
| fixedTop              | CSSResult | CSS for fixing an element to the top of the viewport. |
| fixedRight            | CSSResult | CSS for fixing an element to the right of the viewport. |
| fixedLeft             | CSSResult | CSS for fixing an element to the left of the viewport. |
| fixedBottom           | CSSResult | CSS for fixing an element to the bottom of the viewport. |
| startAligned          | CSSResult | CSS for aligning items to the start of the flex container. |
| centerAligned         | CSSResult | CSS for aligning items to the center of the flex container. |
| endAligned            | CSSResult | CSS for aligning items to the end of the flex container. |
| baseline              | CSSResult | CSS for aligning items to the baseline of the flex container. |
| startJustified        | CSSResult | CSS for justifying content to the start of the flex container. |
| centerJustified       | CSSResult | CSS for justifying content to the center of the flex container. |
| endJustified          | CSSResult | CSS for justifying content to the end of the flex container. |
| aroundJustified       | CSSResult | CSS for distributing space around items in the flex container. |
| justified             | CSSResult | CSS for distributing space between items in the flex container. |
| selfStart             | CSSResult | CSS for aligning an item to the start of the cross axis. |
| selfCenter            | CSSResult | CSS for aligning an item to the center of the cross axis. |
| selfEnd               | CSSResult | CSS for aligning an item to the end of the cross axis. |
| selfStretch           | CSSResult | CSS for stretching an item to fill the cross axis.     |
| selfBaseline          | CSSResult | CSS for aligning an item to the baseline of the cross axis. |
| startAlignedContent   | CSSResult | CSS for aligning content to the start of the flex line. |
| endAlignedContent     | CSSResult | CSS for aligning content to the end of the flex line. |
| centerAlignedContent  | CSSResult | CSS for aligning content to the center of the flex line. |
| beteweenAlignedContent| CSSResult | CSS for distributing space between lines in the flex container. |
| aroundAlignedContent  | CSSResult | CSS for distributing space around lines in the flex container. |

## Methods

There are no methods in this file as it only exports constants.

## Events

There are no events in this file as it only exports constants.

## Examples

```typescript
import { displayFlex, vertical } from './path-to-this-file';

// Example usage of the exported styles
const myElementStyles = css`
  ${displayFlex}
  ${vertical}
  // additional styles here
`;
```