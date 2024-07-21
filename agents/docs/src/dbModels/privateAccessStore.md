# PsPrivateAccessStore

The `PsPrivateAccessStore` class is a Sequelize model that manages the storage and retrieval of encrypted API keys for private access to AI models and external APIs. It includes methods for encrypting and decrypting API keys, as well as managing usage statistics and key statuses.

## Properties

| Name                | Type                              | Description                                                                 |
|---------------------|-----------------------------------|-----------------------------------------------------------------------------|
| id                  | number                            | Primary key.                                                                |
| group_id            | number                            | ID of the group associated with the API key.                                |
| user_id             | number                            | ID of the user associated with the API key.                                 |
| ai_model_id         | number \| undefined               | ID of the AI model associated with the API key.                             |
| external_api_id     | number \| undefined               | ID of the external API associated with the API key.                         |
| encrypted_api_key   | string                            | Encrypted API key.                                                          |
| encrypted_aes_key   | string                            | Encrypted AES key used for encrypting the API key.                          |
| configuration       | PsPrivateAccessStoreConfiguration | Configuration settings for the private access store.                        |
| usage               | PsPrivateAccessStoreUsage         | Usage statistics for the API key.                                           |
| created_at          | Date                              | Timestamp when the record was created.                                      |
| updated_at          | Date                              | Timestamp when the record was last updated.                                 |
| last_used_at        | Date \| undefined                 | Timestamp when the API key was last used.                                   |
| is_active           | boolean                           | Indicates whether the API key is active.                                    |
| Group               | YpGroupData \| undefined          | Associated group data.                                                      |
| User                | YpUserData \| undefined           | Associated user data.                                                       |

## Methods

| Name                          | Parameters                                                                 | Return Type                  | Description                                                                                       |
|-------------------------------|----------------------------------------------------------------------------|------------------------------|---------------------------------------------------------------------------------------------------|
| encryptApiKey                 | apiKey: string                                                             | { encryptedApiKey: string, encryptedAesKey: string } | Encrypts an API key using AES and RSA encryption.                                                |
| decryptApiKey                 | encryptedApiKey: string, encryptedAesKey: string                           | string                       | Decrypts an encrypted API key using AES and RSA decryption.                                       |
| addPreEncryptedKey            | groupId: number, userId: number, aiModelId: number \| undefined, externalApiId: number \| undefined, encryptedApiKey: string, encryptedAesKey: string, configuration: PsPrivateAccessStoreConfiguration | Promise<PsPrivateAccessStore> | Adds a pre-encrypted API key to the store.                                                        |
| getApiKeys                    | groupId: number, options: GetApiKeysOptions = {}                           | Promise<PsPrivateAccessStore[]> | Retrieves API keys based on the provided options.                                                 |
| incrementUsageAndGetApiKey    | groupId: number, options: IncrementUsageOptions = {}                       | Promise<string \| null>      | Increments the usage of an API key and retrieves the decrypted API key.                           |
| setKeyStatus                  | id: number, isActive: boolean                                              | Promise<boolean>             | Sets the status of an API key to active or inactive.                                              |
| getUsage                      | id: number                                                                 | Promise<PsPrivateAccessStoreUsage \| null> | Retrieves the usage statistics for a specific API key.                                            |
| isValidEncryptedFormat        | encryptedApiKey: string                                                    | boolean                      | Validates the format of an encrypted API key.                                                     |
| isValidHex                    | str: string                                                                | boolean                      | Validates if a string is a valid hexadecimal value.                                               |
| isValidBase64                 | str: string                                                                | boolean                      | Validates if a string is a valid Base64 value.                                                    |

## Example

```typescript
import { PsPrivateAccessStore } from '@policysynth/agents/dbModels/privateAccessStore.js';

// Example usage of PsPrivateAccessStore
(async () => {
  const encryptedData = PsPrivateAccessStore.encryptApiKey('my-secret-api-key');
  console.log('Encrypted Data:', encryptedData);

  const decryptedApiKey = PsPrivateAccessStore.decryptApiKey(
    encryptedData.encryptedApiKey,
    encryptedData.encryptedAesKey
  );
  console.log('Decrypted API Key:', decryptedApiKey);

  const newStore = await PsPrivateAccessStore.addPreEncryptedKey(
    1, // groupId
    1, // userId
    undefined, // aiModelId
    1, // externalApiId
    encryptedData.encryptedApiKey,
    encryptedData.encryptedAesKey,
    {
      maxBudget: {
        perDay: 1000,
        petMonth: 30000,
        total: 100000,
      },
      emailNotificationBudgetThresholds: {
        daily: 800,
        monthly: 25000,
      },
    }
  );
  console.log('New Store:', newStore);

  const apiKeys = await PsPrivateAccessStore.getApiKeys(1, { isActive: true });
  console.log('API Keys:', apiKeys);

  const apiKey = await PsPrivateAccessStore.incrementUsageAndGetApiKey(1, {
    externalApiId: 1,
    incrementAmount: 10,
  });
  console.log('Decrypted API Key after increment:', apiKey);

  const usage = await PsPrivateAccessStore.getUsage(newStore.id);
  console.log('Usage:', usage);

  const statusUpdated = await PsPrivateAccessStore.setKeyStatus(newStore.id, false);
  console.log('Status Updated:', statusUpdated);
})();
```