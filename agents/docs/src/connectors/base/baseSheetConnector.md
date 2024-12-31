# PsBaseSheetConnector

The `PsBaseSheetConnector` is an abstract class that extends the `PsBaseConnector`. It provides a base structure for connectors that interact with spreadsheet-like data sources. This class defines several abstract methods that must be implemented by any subclass, allowing for operations such as retrieving, updating, and formatting data within a sheet.

## Properties

This class does not define any specific properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name                | Parameters                          | Return Type   | Description                                                                 |
|---------------------|-------------------------------------|---------------|-----------------------------------------------------------------------------|
| `getSheet`          | None                                | `Promise<string[][]>` | Retrieves the entire sheet as a 2D array of strings.                        |
| `updateSheet`       | `data: string[][]`                  | `Promise<void>` | Updates the entire sheet with the provided 2D array of strings.             |
| `addSheetIfNotExists` | `sheetName: string`               | `Promise<void>` | Adds a new sheet with the given name if it does not already exist.          |
| `getRange`          | `range: string`                     | `Promise<string[][]>` | Retrieves a specific range of cells as a 2D array of strings.               |
| `updateRange`       | `range: string, data: string[][]`   | `Promise<void>` | Updates a specific range of cells with the provided 2D array of strings.    |
| `createNewSheet`    | `sheetName: string`                 | `Promise<void>` | Creates a new sheet with the specified name.                                |
| `formatCells`       | `range: string, format: any`        | `Promise<void>` | Applies the specified format to a range of cells.                           |

## Example

```typescript
import { PsBaseSheetConnector } from '@policysynth/agents/connectors/base/baseSheetConnector.js';

class MySheetConnector extends PsBaseSheetConnector {
  async getSheet(): Promise<string[][]> {
    // Implementation here
  }

  async updateSheet(data: string[][]): Promise<void> {
    // Implementation here
  }

  async addSheetIfNotExists(sheetName: string): Promise<void> {
    // Implementation here
  }

  async getRange(range: string): Promise<string[][]> {
    // Implementation here
  }

  async updateRange(range: string, data: string[][]): Promise<void> {
    // Implementation here
  }

  async createNewSheet(sheetName: string): Promise<void> {
    // Implementation here
  }

  async formatCells(range: string, format: any): Promise<void> {
    // Implementation here
  }
}
```

This example demonstrates how to extend the `PsBaseSheetConnector` to create a custom sheet connector by implementing the abstract methods.