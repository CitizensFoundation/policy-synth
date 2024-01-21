# YpAppStyles

The `YpAppStyles` is a constant that holds the CSS template literal for styling components using the `lit` library.

## Properties

No properties are defined as `YpAppStyles` is a constant of type `CSSResultGroup`.

## Methods

No methods are defined as `YpAppStyles` is a constant and does not have methods.

## Examples

```typescript
import { YpAppStyles } from './path-to-yp-app-styles';

// Example usage in a lit-element
class MyCustomElement extends LitElement {
  static styles = [YpAppStyles];

  render() {
    return html`
      <main>
        <!-- content -->
      </main>
    `;
  }
}
```

Note: Replace `'./path-to-yp-app-styles'` with the actual path where `YpAppStyles` is located.