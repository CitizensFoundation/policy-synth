# YpPostHelpers

This class provides helper methods for dealing with posts in a web application.

## Methods

| Name            | Parameters                        | Return Type | Description                                                                 |
|-----------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| fullPostUrl     | post: YpPostData                  | string      | Generates a full URL for a given post, encoding it for use in web contexts. |
| uniqueInDomain  | array: Array<YpGroupData>, domainId: number | Array<YpGroupData> | Filters an array of group data to unique values within a specific domain.   |

## Examples

```typescript
// Example usage of fullPostUrl method
const postUrl: string = YpPostHelpers.fullPostUrl(postData);

// Example usage of uniqueInDomain method
const uniqueGroups: Array<YpGroupData> = YpPostHelpers.uniqueInDomain(groupDataArray, domainId);
```