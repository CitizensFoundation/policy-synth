# updateEvidenceWebPageSchema

This function updates the schema for the `EvidenceWebPage` class in the `EvidenceWebPageVectorStore` by adding or updating properties related to web page metadata.

## Methods

| Name                        | Parameters | Return Type | Description |
|-----------------------------|------------|-------------|-------------|
| updateEvidenceWebPageSchema | None       | void        | Asynchronously updates the schema for the `EvidenceWebPage` class with various metadata properties. |

## Example

```javascript
// Example usage of updateEvidenceWebPageSchema
import { updateEvidenceWebPageSchema } from '@policysynth/agents/vectorstore/utils/updateEvidenceWebPageSchema.js';

(async () => {
  await updateEvidenceWebPageSchema();
})();
```