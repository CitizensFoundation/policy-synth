# Website

This class represents a website model with properties and methods to interact with the database and perform operations such as finding similar websites based on embeddings.

## Properties

| Name         | Type      | Description                           |
|--------------|-----------|---------------------------------------|
| id           | number    | Unique identifier for the website.    |
| name         | string    | Name of the website.                  |
| slug         | string    | Slug for the website URL.             |
| description  | string    | Description of the website.           |
| image        | string    | Image URL for the website.            |
| embedding    | number[]  | Embedding vector for the website.     |
| createdAt    | Date      | Timestamp when the website was created. |
| updatedAt    | Date      | Timestamp when the website was last updated. |

## Methods

| Name       | Parameters                                  | Return Type            | Description                                                                 |
|------------|---------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| getSimilar | searchTerm: string, skip: number, limit: number | Promise<Model[]> | Finds and returns similar websites based on the search term's embedding. |
| initModel  | None                                        | void                   | Initializes the model with its schema and hooks.                           |

## Examples

```
// Example usage of Website model
import Website from '@policysynth/api/models/website.js';

// Initializing the model
Website.initModel();

// Finding similar websites
const similarWebsites = await Website.getSimilar("example search term", 0, 10);
console.log(similarWebsites);
```