# PsPrivateAccessStore

A secure Sequelize model for storing and managing encrypted API keys and usage tracking for private access to AI models or external APIs, scoped to groups and users. This class provides encryption/decryption utilities, usage tracking, and secure access patterns to prevent accidental exposure of sensitive keys.

**File:** `@policysynth/agents/dbModels/privateAccessStore.js`

---

## Properties

| Name                | Type                                   | Description                                                                                  |
|---------------------|----------------------------------------|----------------------------------------------------------------------------------------------|
| id                  | number                                 | Primary key.                                                                                 |
| group_id            | number                                 | ID of the group this key is associated with.                                                 |
| user_id             | number                                 | ID of the user who added the key.                                                            |
| ai_model_id         | number \| undefined                    | Optional: ID of the AI model this key is for.                                                |
| external_api_id     | number \| undefined                    | Optional: ID of the external API this key is for.                                            |
| encrypted_api_key   | string                                 | The API key, encrypted with AES and then the AES key encrypted with RSA.                     |
| encrypted_aes_key   | string                                 | The AES key, encrypted with RSA public key (base64 encoded).                                 |
| configuration       | PsPrivateAccessStoreConfiguration      | Configuration object for budget and notification thresholds.                                  |
| usage               | PsPrivateAccessStoreUsage              | Usage tracking object (daily, monthly, total).                                               |
| created_at          | Date                                   | Creation timestamp.                                                                          |
| updated_at          | Date                                   | Last update timestamp.                                                                       |
| last_used_at        | Date \| undefined                      | Last time this key was used.                                                                 |
| is_active           | boolean                                | Whether this key is currently active.                                                        |
| Group               | YpGroupData \| undefined               | (Association) The group object.                                                              |
| User                | YpUserData \| undefined                | (Association) The user object.                                                               |

---

## Associated Types

### PsPrivateAccessStoreConfiguration

```typescript
interface PsPrivateAccessStoreConfiguration {
  maxBudget: {
    perDay: number;
    petMonth: number;
    total: number;
  };
  emailNotificationBudgetThresholds: {
    daily: number;
    monthly: number;
  };
}
```

### PsPrivateAccessStoreUsage

```typescript
interface PsPrivateAccessStoreUsage {
  dailyUse: number;
  monthlyUse: number;
  totalUse: number;
}
```

### GetApiKeysOptions

```typescript
interface GetApiKeysOptions {
  aiModelId?: number;
  externalApiId?: number;
  isActive?: boolean;
}
```

### IncrementUsageOptions

```typescript
interface IncrementUsageOptions extends GetApiKeysOptions {
  incrementAmount?: number;
}
```

---

## Methods

| Name                              | Parameters                                                                                                                                                                                                 | Return Type                        | Description                                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|---------------------------------------------------------------------------------------------------------------|
| encryptApiKey                      | apiKey: string                                                                                                                                                                                           | { encryptedApiKey: string; encryptedAesKey: string } | Encrypts an API key using AES (random key) and encrypts the AES key with RSA public key.                      |
| decryptApiKey                      | encryptedApiKey: string, encryptedAesKey: string                                                                                                                                                         | string                             | Decrypts the API key using the provided encrypted AES key and the RSA private key.                            |
| addPreEncryptedKey                 | groupId: number, userId: number, aiModelId: number \| undefined, externalApiId: number \| undefined, encryptedApiKey: string, encryptedAesKey: string, configuration: PsPrivateAccessStoreConfiguration | Promise<PsPrivateAccessStore>      | Adds a new pre-encrypted API key to the store.                                                                |
| getApiKeys                         | groupId: number, options?: GetApiKeysOptions                                                                                                                      | Promise<PsPrivateAccessStore[]>    | Retrieves all API keys for a group, optionally filtered by model/API and active status.                       |
| incrementUsageAndGetApiKey         | groupId: number, options?: IncrementUsageOptions                                                                                                                   | Promise<string \| null>            | Atomically increments usage counters and returns the decrypted API key for use.                                |
| setKeyStatus                       | id: number, isActive: boolean                                                                                                                                                                            | Promise<boolean>                   | Sets the active status of a key by ID.                                                                        |
| getUsage                           | id: number                                                                                                                                                                                               | Promise<PsPrivateAccessStoreUsage \| null> | Retrieves the usage object for a given key.                                                                   |

#### Private/Utility Methods

| Name                  | Parameters                | Return Type | Description                                                                                 |
|-----------------------|--------------------------|-------------|---------------------------------------------------------------------------------------------|
| isValidEncryptedFormat| encryptedApiKey: string  | boolean     | Checks if the encrypted API key string is in the expected format.                            |
| isValidHex            | str: string              | boolean     | Checks if a string is valid hexadecimal.                                                    |
| isValidBase64         | str: string              | boolean     | Checks if a string is valid base64.                                                         |

---

## Security Proxy

Direct access to `findAll`, `findOne`, and `findByPk` is **blocked**. Use `incrementUsageAndGetApiKey` for secure access. Attempts to use blocked methods will log a warning and throw an error.

---

## Example

```typescript
import { PsPrivateAccessStore } from '@policysynth/agents/dbModels/privateAccessStore.js';

// Encrypt and store a new API key
const { encryptedApiKey, encryptedAesKey } = PsPrivateAccessStore.encryptApiKey("my-secret-api-key");

const config = {
  maxBudget: { perDay: 1000, petMonth: 20000, total: 100000 },
  emailNotificationBudgetThresholds: { daily: 0.8, monthly: 0.9 }
};

await PsPrivateAccessStore.addPreEncryptedKey(
  1, // groupId
  2, // userId
  3, // aiModelId
  undefined, // externalApiId
  encryptedApiKey,
  encryptedAesKey,
  config
);

// Securely increment usage and get the decrypted API key
const apiKey = await PsPrivateAccessStore.incrementUsageAndGetApiKey(1, {
  aiModelId: 3,
  incrementAmount: 5
});
console.log("Decrypted API Key:", apiKey);

// Set a key as inactive
await PsPrivateAccessStore.setKeyStatus(1, false);

// Get usage stats
const usage = await PsPrivateAccessStore.getUsage(1);
console.log("Usage:", usage);
```

---

## Notes

- **Encryption:** API keys are encrypted with a random AES key, which is itself encrypted with an RSA public key. Decryption requires the corresponding RSA private key.
- **Usage Tracking:** Usage is tracked per day, per month, and in total, and can be used for budget enforcement and notifications.
- **Security:** Direct access to sensitive methods is blocked via a Proxy. Always use the provided secure methods.
- **Associations:** The model is associated with `User` and `Group` models for relational integrity.

---

**Do not use raw Sequelize `findAll`/`findOne`/`findByPk` on this model. Always use the secure methods provided.**