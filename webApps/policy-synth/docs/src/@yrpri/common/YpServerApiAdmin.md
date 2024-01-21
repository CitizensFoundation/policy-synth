# YpServerApiAdmin

This class extends `YpServerApiBase` and provides methods for administrative actions on a server API, such as adding or updating collection items, managing translations, handling videos, fetching community folders, retrieving analytics data, and managing SSN list counts.

## Properties

No public properties are documented for this class.

## Methods

| Name                    | Parameters                                      | Return Type | Description                                                                 |
|-------------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| addCollectionItem       | collectionId: number, collectionItemType: string, body: Record<string, unknown> | Promise     | Adds an item to a collection with the specified type and body data.         |
| updateTranslation       | collectionType: string, collectionId: number, body: YpTranslationTextData | Promise     | Updates the translation for a given collection type and ID with the provided translation data. |
| getTextForTranslations  | collectionType: string, collectionId: number, targetLocale: string | Promise     | Retrieves text for translations for a specific collection type, ID, and target locale. |
| addVideoToCollection    | collectionId: number, body: Record<string, unknown>, type: string | Promise     | Adds a video to a collection with the specified ID, body data, and type.    |
| getCommunityFolders     | domainId: number                                | Promise     | Fetches available community folders for a given domain ID.                  |
| getAnalyticsData        | communityId: number, type: string, params: string | Promise     | Retrieves analytics data for a community with the specified ID, type, and additional parameters. |
| getSsnListCount         | communityId: number, ssnLoginListDataId: number | Promise     | Gets the count of SSN login list for a community with the specified ID.     |
| deleteSsnLoginList      | communityId: number, ssnLoginListDataId: number | Promise     | Deletes the SSN login list for a community with the specified ID.           |

## Events

No events are documented for this class.

## Examples

```typescript
// Example usage of adding a collection item
const apiAdmin = new YpServerApiAdmin();
apiAdmin.addCollectionItem(123, 'article', { title: 'New Article', content: 'Content of the article.' });

// Example usage of updating a translation
apiAdmin.updateTranslation('article', 123, { en: 'English Text', fr: 'Texte français' });

// Example usage of getting text for translations
apiAdmin.getTextForTranslations('article', 123, 'fr');

// Example usage of adding a video to a collection
apiAdmin.addVideoToCollection(123, { videoUrl: 'http://example.com/video.mp4' }, 'introduction');

// Example usage of fetching community folders
apiAdmin.getCommunityFolders(1);

// Example usage of retrieving analytics data
apiAdmin.getAnalyticsData(1, 'visits', 'startDate=2021-01-01&endDate=2021-01-31');

// Example usage of getting SSN list count
apiAdmin.getSsnListCount(1, 2);

// Example usage of deleting an SSN login list
apiAdmin.deleteSsnLoginList(1, 2);
```