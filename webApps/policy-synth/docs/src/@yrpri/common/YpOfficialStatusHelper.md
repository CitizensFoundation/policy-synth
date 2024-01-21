# YpOfficialStatusHelper

A helper class for managing and translating official status options.

## Methods

| Name                           | Parameters                  | Return Type | Description                                                                 |
|--------------------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| officialStatusOptions          | t: Function                 | Array       | Returns an array of objects containing official status options and translations. |
| officialStatusOptionsName      | official_status: number, t: Function | string       | Returns the translated name for a given official status value.              |
| officialStatusOptionsNamePlural| official_status: number, t: Function | string       | Returns the plural form of the translated name for a given official status value. |

## Examples

```typescript
// Example usage of the YpOfficialStatusHelper class

// Function to simulate translation function
const translate = (key: string) => {
  const translations = {
    'status.published': 'Published',
    'pluralStatus.published': 'Published Items',
    'status.successful': 'Successful',
    'pluralStatus.successful': 'Successful Items',
    // ... other translations
  };
  return translations[key] || key;
};

// Getting official status options with translations
const options = YpOfficialStatusHelper.officialStatusOptions(translate);
console.log(options);

// Getting the name of a specific official status
const statusName = YpOfficialStatusHelper.officialStatusOptionsName(0, translate);
console.log(statusName); // Output: Published

// Getting the plural name of a specific official status
const statusNamePlural = YpOfficialStatusHelper.officialStatusOptionsNamePlural(0, translate);
console.log(statusNamePlural); // Output: Published Items
```