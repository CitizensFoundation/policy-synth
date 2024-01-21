# YpCollectionHelpers

This class contains static helper methods for manipulating and retrieving information from collections of various types.

## Properties

This class does not have properties as it only contains static methods.

## Methods

| Name              | Parameters                                          | Return Type                                  | Description                                                                                     |
|-------------------|-----------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------------------------------------|
| splitByStatus     | items: Array<YpCollectionData>, containerConfig: YpCollectionConfiguration \| undefined | YpSplitCollectionsReturn                    | Splits the collection items by their status into active, archived, and featured collections.    |
| logoImagePath     | collectionType: string \| undefined, collection: YpCollectionData                  | string \| undefined                         | Returns the path to the logo image for the specified collection type and collection.            |
| logoImages        | collectionType: string \| undefined, collection: YpCollectionData                  | Array<YpImageData> \| undefined             | Retrieves the logo images for the specified collection type and collection.                    |
| nameTextType      | collectionType: string \| undefined                                             | string \| undefined                         | Determines the text type for the name based on the collection type.                            |
| descriptionTextType | collectionType: string \| undefined                                           | string \| undefined                         | Determines the text type for the description based on the collection type.                     |

## Examples

```typescript
// Example usage of splitting collections by status
const collections: Array<YpCollectionData> = [...]; // your collection data
const config: YpCollectionConfiguration | undefined = {...}; // your configuration
const splitCollections = YpCollectionHelpers.splitByStatus(collections, config);

// Example usage of getting a logo image path
const collectionType: string | undefined = 'domain';
const collection: YpCollectionData = {...}; // your collection data
const logoPath = YpCollectionHelpers.logoImagePath(collectionType, collection);

// Example usage of getting logo images
const logoImages = YpCollectionHelpers.logoImages(collectionType, collection);

// Example usage of getting name text type
const nameType = YpCollectionHelpers.nameTextType(collectionType);

// Example usage of getting description text type
const descriptionType = YpCollectionHelpers.descriptionTextType(collectionType);
```