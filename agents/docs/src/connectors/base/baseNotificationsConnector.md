# PsBaseNotificationsConnector

The `PsBaseNotificationsConnector` is an abstract class that extends the `PsBaseConnector`. It provides a base structure for implementing notification connectors, which are responsible for sending notifications and retrieving messages from a specified channel.

## Properties

This class does not define any additional properties beyond those inherited from `PsBaseConnector`.

## Methods

| Name              | Parameters                  | Return Type     | Description                                                                 |
|-------------------|-----------------------------|-----------------|-----------------------------------------------------------------------------|
| `sendNotification`| `channel: string, message: string` | `Promise<void>` | Abstract method to send a notification to a specified channel.              |
| `getMessages`     | `channel: string`           | `Promise<string[]>` | Abstract method to retrieve messages from a specified channel.              |

## Example

```typescript
import { PsBaseNotificationsConnector } from '@policysynth/agents/connectors/base/baseNotificationsConnector.js';

class MyNotificationsConnector extends PsBaseNotificationsConnector {
  async sendNotification(channel: string, message: string): Promise<void> {
    // Implementation for sending a notification
  }

  async getMessages(channel: string): Promise<string[]> {
    // Implementation for retrieving messages
    return [];
  }
}

const myConnector = new MyNotificationsConnector();
myConnector.sendNotification('general', 'Hello, World!');
myConnector.getMessages('general').then(messages => console.log(messages));
```

In this example, `MyNotificationsConnector` extends `PsBaseNotificationsConnector` and provides concrete implementations for the `sendNotification` and `getMessages` methods.