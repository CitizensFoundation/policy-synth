# PsBaseSheetConnector

An abstract base class for implementing connectors to spreadsheet-like data sources (e.g., Google Sheets, Excel Online). Extends `PsBaseConnector` and provides a standard interface for reading, updating, and managing sheets and their ranges.

## Properties

This class does not define additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name                | Parameters                                   | Return Type         | Description                                                                                  |
|---------------------|----------------------------------------------|---------------------|----------------------------------------------------------------------------------------------|
| getSheet            | —                                            | Promise<string[][]> | Returns the entire sheet as a 2D array of strings.                                           |
| updateSheet         | data: string[][]                             | Promise<void>       | Updates the entire sheet with the provided 2D array of strings.                              |
| addSheetIfNotExists | sheetName: string                            | Promise<void>       | Adds a new sheet with the given name if it does not already exist.                           |
| getRange            | range: string                                | Promise<string[][]> | Retrieves the values in the specified range as a 2D array of strings.                        |
| updateRange         | range: string, data: string[][]              | Promise<void>       | Updates the specified range with the provided 2D array of strings.                           |
| createNewSheet      | sheetName: string                            | Promise<void>       | Creates a new sheet with the specified name.                                                 |
| formatCells         | range: string, format: any                   | Promise<void>       | Applies formatting to the specified range. The format parameter is implementation-specific.   |
| clearRange          | range: string                                | Promise<void>       | Clears the contents of the specified range.                                                  |

## Example

```typescript
import { PsBaseSheetConnector } from '@policysynth/agents/connectors/base/baseSheetConnector.js';

class MySheetConnector extends PsBaseSheetConnector {
  async getSheet(): Promise<string[][]> {
    // Implementation for retrieving the entire sheet
  }
  async updateSheet(data: string[][]): Promise<void> {
    // Implementation for updating the entire sheet
  }
  async addSheetIfNotExists(sheetName: string): Promise<void> {
    // Implementation for adding a sheet if it doesn't exist
  }
  async getRange(range: string): Promise<string[][]> {
    // Implementation for retrieving a range
  }
  async updateRange(range: string, data: string[][]): Promise<void> {
    // Implementation for updating a range
  }
  async createNewSheet(sheetName: string): Promise<void> {
    // Implementation for creating a new sheet
  }
  async formatCells(range: string, format: any): Promise<void> {
    // Implementation for formatting cells
  }
  async clearRange(range: string): Promise<void> {
    // Implementation for clearing a range
  }
}
```

This abstract class is intended to be extended by concrete implementations for specific spreadsheet providers. Each method must be implemented in the subclass.