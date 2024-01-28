# Website

This class represents a website model with properties such as name, slug, description, image, and embedding. It includes methods for initializing the model and retrieving similar websites based on a search term.

## Properties

| Name          | Type            | Description               |
|---------------|-----------------|---------------------------|
| id            | number          | Unique identifier for the website. |
| name          | string          | Name of the website.      |
| slug          | string          | Slug for the website URL. |
| description   | string          | Description of the website. |
| image         | string          | Image URL for the website. |
| embedding     | number[]        | Numerical embedding representing the website. |
| createdAt     | Date            | Timestamp when the website was created. |
| updatedAt     | Date            | Timestamp when the website was last updated. |

## Methods

| Name       | Parameters                          | Return Type | Description                 |
|------------|-------------------------------------|-------------|-----------------------------|
| getSimilar | searchTerm: string, skip: number = 0, limit: number = 9999 | Promise<Website[]> | Retrieves similar websites based on the search term. |
| initModel  |                                     | void        | Initializes the website model with its schema. |

## Examples

```typescript
// Example usage of Website model
import Website from '@policysynth/apimodels/website.js';

// Initializing the model
Website.initModel();

// Fetching similar websites
const similarWebsites = await Website.getSimilar("example search term");
```