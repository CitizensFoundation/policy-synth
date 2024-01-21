# ShadowStyles

`ShadowStyles` is a CSS module that provides shadow effect styles that can be applied to elements to simulate elevation in a material design aesthetic. The styles range from 2dp (dots per inch) to 24dp, with each level of elevation having a distinct shadow effect.

## Properties

There are no properties for this module as it is a collection of CSS class styles.

## Methods

There are no methods for this module as it is a collection of CSS class styles.

## Events

There are no events for this module as it is a collection of CSS class styles.

## Examples

```typescript
import { ShadowStyles } from './path-to-ShadowStyles';

// Apply the shadow style to an element in LitElement
class MyCustomElement extends LitElement {
  static styles = [ShadowStyles];

  render() {
    return html`
      <div class="shadow-elevation-4dp">This element has a 4dp shadow.</div>
    `;
  }
}
```

Note: Replace `'./path-to-ShadowStyles'` with the actual path where the `ShadowStyles` module is located.