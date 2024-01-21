# AcActivityRecommendedPosts

`AcActivityRecommendedPosts` is a custom web component that extends `YpBaseElement` to display a list of recommended posts. It uses `lit` for rendering and defining properties, and it includes styles for presentation.

## Properties

| Name             | Type                     | Description                                      |
|------------------|--------------------------|--------------------------------------------------|
| recommendedPosts | Array<YpPostData>        | An array of recommended post data objects.       |

## Methods

No public methods documented.

## Events

No custom events documented.

## Examples

```typescript
// Example usage of AcActivityRecommendedPosts
<ac-activity-recommended-posts .recommendedPosts=${recommendedPostsArray}></ac-activity-recommended-posts>
```

In the example above, `recommendedPostsArray` should be an array of `YpPostData` objects that you want to display as recommended posts.