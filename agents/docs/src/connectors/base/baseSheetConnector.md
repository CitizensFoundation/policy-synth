# PsBaseSheetConnector

The `PsBaseSheetConnector` is an abstract class that extends the `PsBaseConnector`. It provides a base structure for connectors that interact with spreadsheet-like data sources. This class defines methods for retrieving and updating data in a sheet, as well as working with specific ranges within the sheet.

## Properties

This class does not define any additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name          | Parameters                          | Return Type       | Description                                                                 |
|---------------|-------------------------------------|-------------------|-----------------------------------------------------------------------------|
| `getSheet`    | None                                | `Promise<string[][]>` | Abstract method to retrieve the entire sheet data.                          |
| `updateSheet` | `data: string[][]`                  | `Promise<void>`   | Abstract method to update the entire sheet with the provided data.          |
| `getRange`    | `range: string`                     | `Promise<string[][]>` | Abstract method to retrieve data from a specific range in the sheet.        |
| `updateRange` | `range: string, data: string[][]`   | `Promise<void>`   | Abstract method to update a specific range in the sheet with the provided data. |

## Example

```typescript
import { PsBaseSheetConnector } from '@policysynth/agents/connectors/base/baseSheetConnector.js';

class MySheetConnector extends PsBaseSheetConnector {
  async getSheet(): Promise<string[][]> {
    // Implementation to retrieve the entire sheet data
  }

  async updateSheet(data: string[][]): Promise<void> {
    // Implementation to update the entire sheet with the provided data
  }

  async getRange(range: string): Promise<string[][]> {
    // Implementation to retrieve data from a specific range in the sheet
  }

  async updateRange(range: string, data: string[][]): Promise<void> {
    // Implementation to update a specific range in the sheet with the provided data
  }
}
```

In this example, `MySheetConnector` extends `PsBaseSheetConnector` and provides concrete implementations for the abstract methods defined in the base class.