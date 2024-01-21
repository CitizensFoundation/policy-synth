# YpCollectionItemsGrid

A custom element that renders a grid or list of collection items using `lit-virtualizer`.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| collection            | YpCollectionData \| undefined             | The collection data object.                                                 |
| collectionItems       | Array\<YpCollectionData\> \| undefined    | An array of collection item data objects.                                   |
| collectionItemType    | string                                    | The type of collection items, e.g., 'community', 'group', 'post'.           |
| sortedCollectionItems | Array\<YpCollectionData\> \| undefined    | An array of sorted collection item data objects.                            |
| grid                  | boolean                                   | A flag indicating whether to display items in a grid layout.                |
| resetListSize         | Function \| undefined                     | A function to reset the size of the list.                                   |
| skipIronListWidth     | boolean                                   | A flag to skip setting the width of the iron list (not used in this class). |

## Methods

| Name                | Parameters                        | Return Type | Description                                                                                   |
|---------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| renderItem          | item: YpCollectionData, index: number | TemplateResult | Renders a single collection item card.                                                        |
| pluralItemType      |                                   | string      | Returns the plural form of the collection item type.                                          |
| _keypress           | event: KeyboardEvent              | void        | Handles keypress events, specifically the 'Enter' key for selecting an item.                  |
| refresh             |                                   | Promise<void> | An async method to refresh the list (not implemented).                                        |
| firstUpdated        | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle callback that runs after the component's first render.                             |
| connectedCallback   |                                   | Promise<void> | Lifecycle callback that runs when the component is inserted into the DOM.                     |
| disconnectedCallback|                                   | void        | Lifecycle callback that runs when the component is removed from the DOM.                      |
| _selectedItemChanged| event: CustomEvent                | void        | Handles the selection of an item and navigates to the appropriate page.                       |
| scrollToItem        | item: YpDatabaseItem \| undefined | void        | Scrolls to the specified item in the list.                                                    |

## Events (if any)

- **keypress**: Emitted when a key is pressed while an item card is focused.
- **click**: Emitted when an item card is clicked.

## Examples

```typescript
// Example usage of the YpCollectionItemsGrid
const collectionItemsGrid = document.createElement('yp-collection-items-grid');
collectionItemsGrid.collection = someCollectionData;
collectionItemsGrid.collectionItems = someCollectionItemsData;
collectionItemsGrid.collectionItemType = 'community';
collectionItemsGrid.grid = true;
document.body.appendChild(collectionItemsGrid);
```

Please note that the above example assumes that `someCollectionData` and `someCollectionItemsData` are predefined variables containing the appropriate data for the `collection` and `collectionItems` properties, respectively.