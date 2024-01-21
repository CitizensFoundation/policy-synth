# YpCollection

Abstract class that provides a base for collection components in the application.

## Properties

| Name               | Type                                                  | Description                                                                 |
|--------------------|-------------------------------------------------------|-----------------------------------------------------------------------------|
| noHeader           | boolean                                               | If true, the collection header is not rendered.                             |
| tabsHidden         | boolean                                               | If true, the tabs are hidden.                                               |
| collectionId       | number \| undefined                                   | The ID of the collection.                                                   |
| collectionName     | string \| undefined                                   | The name of the collection.                                                 |
| collection         | YpCollectionData \| undefined                         | The collection data object.                                                 |
| subRoute           | string \| undefined                                   | The sub-route for the collection.                                           |
| selectedTab        | number                                                | The index of the currently selected tab.                                    |
| collectionItems    | Array<YpCommunityData \| YpGroupData> \| undefined    | The items within the collection.                                            |
| hideNewsfeed       | boolean                                               | If true, the newsfeed tab is hidden.                                        |
| locationHidden     | boolean                                               | If true, the location tab is hidden.                                        |
| hideCollection     | boolean                                               | If true, the collection tab is hidden.                                      |
| createFabIcon      | string \| undefined                                   | The icon for the floating action button (FAB) for creating new items.       |
| createFabLabel     | string \| undefined                                   | The label for the FAB for creating new items.                               |
| collectionType     | string                                                | The type of the collection.                                                 |
| collectionItemType | string \| null                                        | The type of items within the collection.                                    |
| collectionCreateFabIcon | string                                           | The icon for the FAB specific to the collection type.                       |
| collectionCreateFabLabel | string                                         | The label for the FAB specific to the collection type.                      |

## Methods

| Name                        | Parameters                                      | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| scrollToCollectionItemSubClass | None                                        | void        | Abstract method to scroll to a specific item within the collection subclass. |
| refresh                      | None                                            | void        | Refreshes the collection data and UI elements.                               |
| _getCollection               | None                                            | Promise<void> | Retrieves the collection data from the server.                              |
| _getHelpPages                | collectionTypeOverride?: string, collectionIdOverride?: number | Promise<void> | Retrieves help pages for the collection.                                    |
| collectionIdChanged          | None                                            | void        | Called when the collection ID changes.                                      |
| _selectTab                   | event: CustomEvent                              | void        | Handles tab selection events.                                               |
| _setSelectedTabFromRoute     | routeTabName: string                            | void        | Sets the selected tab based on the route name.                              |
| scrollToCachedItem           | None                                            | void        | Scrolls to a cached item if available.                                      |
| scrollToCollectionItemSubClassDomain | None                                    | void        | Scrolls to a collection item in the subclass domain.                        |
| setFabIconIfAccess           | onlyAdminCanCreate: boolean, hasCollectionAccess: boolean | void | Sets the FAB icon and label based on access rights.                         |
| _useHardBack                 | configuration: YpCollectionConfiguration        | boolean     | Determines if a hard back navigation should be used based on configuration. |

## Events (if any)

- **yp-logged-in**: Emitted when a user logs in, triggers collection data retrieval.
- **yp-got-admin-rights**: Emitted when a user gets admin rights, triggers a refresh.
- **yp-set-home-link**: Emitted to set the home link data.
- **yp-change-header**: Emitted to change the header information.
- **yp-set-pages**: Emitted to set help pages.

## Examples

```typescript
// Example usage of YpCollection in a subclass
class YpCommunityCollection extends YpCollection {
  constructor() {
    super('community', 'community', 'add', 'Create Community');
  }

  scrollToCollectionItemSubClass() {
    // Implementation for scrolling to a community item
  }
}
```

Please note that this is an abstract class and cannot be instantiated directly. It is intended to be extended by other classes that provide specific implementations for methods like `scrollToCollectionItemSubClass`.