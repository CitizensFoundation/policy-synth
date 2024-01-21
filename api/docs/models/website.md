# Website

The `Website` class extends the `Model` class from Sequelize and represents a website entity with properties such as name, slug, description, image, and an embedding vector. It includes methods to initialize the model and to find similar websites based on a search term.

## Properties

| Name          | Type                          | Description               |
|---------------|-------------------------------|---------------------------|
| id            | number                        | Unique identifier for the website. |
| name          | string                        | Name of the website.      |
| slug          | string                        | Slug for the website URL. |
| description   | string                        | Description of the website. |
| image         | string                        | Image URL for the website. |
| embedding     | number[]                      | Vector representing the website's embedding. |
| createdAt     | Date                          | Timestamp for when the website was created. |
| updatedAt     | Date                          | Timestamp for when the website was last updated. |

## Methods

| Name       | Parameters                  | Return Type            | Description                 |
|------------|-----------------------------|------------------------|-----------------------------|
| getSimilar | searchTerm: string, skip: number = 0, limit: number = 9999 | Promise<Website[]> | Finds and returns similar websites based on the search term. |
| initModel  |                             | void                   | Initializes the Website model with its schema and hooks. |

## Examples

```typescript
// Example usage of initializing the Website model
Website.initModel();

// Example usage of finding similar websites
const similarWebsites = await Website.getSimilar("search term", 0, 10);
```

**Note:** The `embedding` property is a vector of numbers and is used to find similar websites based on the content. The `beforeCreate` and `beforeUpdate` hooks are used to generate and update the embedding vector when a website is created or updated. The `getSimilar` method uses the `pgvector` utility to convert the embedding to SQL format for querying. The `initModel` method sets up the model schema and registers the hooks.