# YpIronListHelpers

A utility class providing static methods to attach and detach listeners related to IronList components within a given base element.

## Properties

This class does not have properties as it only provides static methods.

## Methods

| Name              | Parameters                          | Return Type | Description                                                                 |
|-------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| attachListeners   | baseElement: YpElementWithIronList  | void        | Attaches a resize listener to the base element that updates the IronList.   |
| detachListeners   | baseElement: YpElementWithIronList  | void        | Detaches the resize listener from the base element.                         |

## Examples

```typescript
// Assuming you have a YpElementWithIronList instance named `myElement`
YpIronListHelpers.attachListeners(myElement);

// Later, if you want to remove the listeners from `myElement`
YpIronListHelpers.detachListeners(myElement);
```