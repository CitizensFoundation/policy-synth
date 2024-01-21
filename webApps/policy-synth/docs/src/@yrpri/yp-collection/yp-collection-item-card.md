# YpCollectionItemCard

A custom element that represents a card for a collection item, which can be a group, community, or other types of collections. It displays the collection's logo, name, description, and stats, and can handle different statuses like archived or featured.

## Properties

| Name        | Type                | Description                                                                 |
|-------------|---------------------|-----------------------------------------------------------------------------|
| item        | YpCollectionData    | The collection item data.                                                   |
| itemType    | string              | The type of the collection item (e.g., 'group', 'community').               |
| collection  | YpCollectionData    | The collection data that the item belongs to.                               |

## Methods

| Name                  | Parameters | Return Type | Description                                                                 |
|-----------------------|------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback     | -          | void        | Lifecycle method that runs when the element is added to the DOM.            |
| goToItem              | event: CustomEvent | void | Navigates to the item's detail page when clicked.                           |
| _setupFontNameFontSize| -          | void        | Sets up the font size for the collection name based on the screen width.    |
| updated               | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the properties of the element have changed. |
| renderLogoImage       | -          | TemplateResult | Renders the logo image of the collection item.                              |
| renderDataViz         | -          | TemplateResult | Renders the data visualization for the collection item if available.        |
| renderCardInfo        | -          | TemplateResult | Renders the information section of the card.                                |
| render                | -          | TemplateResult \| typeof nothing | Renders the entire card or nothing if there is no item.                    |

## Events (if any)

- **No custom events are emitted by this component.**

## Examples

```typescript
// Example usage of the YpCollectionItemCard
<yp-collection-item-card
  .item=${myCollectionItem}
  .itemType=${'group'}
  .collection=${myCollection}
></yp-collection-item-card>
```

Note: The `YpCollectionData`, `YpGroupData`, and `YpCommunityData` types are not defined in the provided code and should be defined elsewhere in the codebase. The `YpNavHelpers` and `YpCollectionHelpers` are utility classes used for navigation and collection-related helper functions, respectively. The `YpBaseElement` is the base class that this custom element extends from.