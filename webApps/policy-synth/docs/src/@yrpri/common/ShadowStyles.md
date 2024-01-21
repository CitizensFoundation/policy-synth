# ShadowStyles

The `ShadowStyles` is a CSS module that provides shadow effect styles that can be applied to elements to simulate elevation. These styles are based on Material Design's elevation principles, using box-shadow to create the appearance of depth. The styles range from 2dp (dots per inch) to 24dp, indicating the level of elevation or depth effect.

## Properties

There are no properties for this module as it is a CSS stylesheet.

## Methods

There are no methods for this module as it is a CSS stylesheet.

## Events

There are no events for this module as it is a CSS stylesheet.

## Examples

```typescript
import { ShadowStyles } from './path-to-ShadowStyles';

// Apply the shadow style to a LitElement component
class MyComponent extends LitElement {
  static styles = [ShadowStyles];

  render() {
    return html`
      <div class="shadow-elevation-4dp">This element has a shadow effect.</div>
    `;
  }
}
```

Note: Replace `'./path-to-ShadowStyles'` with the actual path where the `ShadowStyles` module is located.