# CSSStyles

This TypeScript file exports a series of constants representing common CSS styles for use with the `lit` library. Each constant is a `CSSResult` that can be used to style Lit elements.

## Properties

| Name                  | Type       | Description                                   |
|-----------------------|------------|-----------------------------------------------|
| displayFlex           | CSSResult  | Sets an element to use a flex display.        |
| borderBox             | CSSResult  | Sets the box-sizing to border-box.            |
| displayInlineFlex     | CSSResult  | Sets an element to use an inline-flex display.|
| horizontal            | CSSResult  | Sets flex-direction to row.                   |
| vertical              | CSSResult  | Sets flex-direction to column.                |
| wrap                  | CSSResult  | Allows flex items to wrap as needed.          |
| noWrap                | CSSResult  | Prevents flex items from wrapping.            |
| flexFactor            | CSSResult  | Sets the flex factor of an element.           |
| flexFactorAuto        | CSSResult  | Sets the flex factor to auto.                 |
| flexFactorNone        | CSSResult  | Sets the flex factor to none.                 |
| displayNone           | CSSResult  | Hides an element by setting display to none.  |
| flex2                 | CSSResult  | Sets the flex grow factor to 2.               |
| flex3                 | CSSResult  | Sets the flex grow factor to 3.               |
| flex4                 | CSSResult  | Sets the flex grow factor to 4.               |
| flex5                 | CSSResult  | Sets the flex grow factor to 5.               |
| flex6                 | CSSResult  | Sets the flex grow factor to 6.               |
| flex7                 | CSSResult  | Sets the flex grow factor to 7.               |
| flex8                 | CSSResult  | Sets the flex grow factor to 8.               |
| flex9                 | CSSResult  | Sets the flex grow factor to 9.               |
| flex10                | CSSResult  | Sets the flex grow factor to 10.              |
| flex11                | CSSResult  | Sets the flex grow factor to 11.              |
| flex12                | CSSResult  | Sets the flex grow factor to 12.              |
| horizontalReverse     | CSSResult  | Sets flex-direction to row-reverse.           |
| verticalReverse       | CSSResult  | Sets flex-direction to column-reverse.        |
| wrapReverse           | CSSResult  | Sets flex-wrap to wrap-reverse.               |
| displayBlock          | CSSResult  | Sets an element to use block display.         |
| invisible             | CSSResult  | Makes an element invisible.                   |
| relative              | CSSResult  | Sets the position of an element to relative.  |
| fit                   | CSSResult  | Positions an element to fit its container.    |
| scroll                | CSSResult  | Enables touch scrolling.                      |
| fixed                 | CSSResult  | Sets the position of an element to fixed.     |
| fixedTop              | CSSResult  | Fixes an element to the top of the viewport.  |
| fixedRight            | CSSResult  | Fixes an element to the right of the viewport.|
| fixedLeft             | CSSResult  | Fixes an element to the left of the viewport. |
| fixedBottom           | CSSResult  | Fixes an element to the bottom of the viewport.|
| startAligned          | CSSResult  | Aligns items to the start of the flex container.|
| centerAligned         | CSSResult  | Centers items in the flex container.          |
| endAligned            | CSSResult  | Aligns items to the end of the flex container.|
| baseline              | CSSResult  | Aligns items to their baseline.               |
| startJustified        | CSSResult  | Justifies content to the start of the container.|
| centerJustified       | CSSResult  | Centers content in the container.             |
| endJustified          | CSSResult  | Justifies content to the end of the container.|
| aroundJustified       | CSSResult  | Distributes content around the container.     |
| justified             | CSSResult  | Justifies content between the container.      |
| selfStart             | CSSResult  | Aligns the element itself to the start.       |
| selfCenter            | CSSResult  | Centers the element itself.                   |
| selfEnd               | CSSResult  | Aligns the element itself to the end.         |
| selfStretch           | CSSResult  | Stretches the element itself.                 |
| selfBaseline          | CSSResult  | Aligns the element itself to the baseline.    |
| startAlignedContent   | CSSResult  | Aligns content to the start of the flex line. |
| endAlignedContent     | CSSResult  | Aligns content to the end of the flex line.   |
| centerAlignedContent  | CSSResult  | Centers content in the flex line.             |
| beteweenAlignedContent| CSSResult  | Justifies content between in the flex line.   |
| aroundAlignedContent  | CSSResult  | Distributes content around the flex line.     |

## Examples

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { displayFlex, centerJustified } from './css-styles';

@customElement('my-flex-element')
class MyFlexElement extends LitElement {
  static styles = [displayFlex, centerJustified];

  render() {
    return html`<div>Content here will be flex and centered.</div>`;
  }
}
```

Note: The actual CSSResult type is not explicitly defined in the provided code, but it is assumed to be the type returned by the `css` function from the `lit` library.