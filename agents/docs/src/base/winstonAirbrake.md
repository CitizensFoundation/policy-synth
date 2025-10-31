# AirbrakeTransport

A custom [Winston](https://github.com/winstonjs/winston) transport for sending error logs to [Airbrake](https://airbrake.io/). This transport allows you to forward error and warning logs from your application to Airbrake for monitoring and alerting, with support for filtering out specific error messages.

**File:** `@policysynth/agents/base/winstonAirbrake.js`

## AirbrakeTransportOptions

Configuration options for the `AirbrakeTransport` class.

| Name                  | Type                | Description                                                                                 |
|-----------------------|---------------------|---------------------------------------------------------------------------------------------|
| projectId             | number              | The Airbrake project ID.                                                                    |
| projectKey            | string              | The Airbrake project key.                                                                   |
| environment           | string (optional)   | The environment name (e.g., "production", "development"). Defaults to `"production"`.       |
| ignoredErrorMessages  | string[] (optional) | Array of error message substrings to ignore (do not send to Airbrake).                      |
| ...                   | any                 | All other Winston `TransportStreamOptions` are supported.                                   |

## AirbrakeTransport

A Winston transport that sends error logs to Airbrake, with support for filtering out specific error messages.

### Properties

| Name                  | Type         | Description                                                                                 |
|-----------------------|--------------|---------------------------------------------------------------------------------------------|
| notifier              | Notifier     | The Airbrake notifier instance used to send errors.                                         |
| ignoredErrorMessages  | string[]     | List of error message substrings to ignore (do not send to Airbrake).                       |

### Constructor

#### `constructor(opts: AirbrakeTransportOptions)`

Creates a new instance of `AirbrakeTransport`.

- **opts**: `AirbrakeTransportOptions` – Configuration options for the transport.

### Methods

| Name       | Parameters                                                                 | Return Type | Description                                                                                 |
|------------|----------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------|
| log        | info: LogEntry & { stack?: string }, callback: () => void                  | void        | Called by Winston for every log entry. Sends errors to Airbrake unless ignored.             |
| toSeverity | level: string                                                              | "error" \| "warning" \| "info" | Maps Winston log levels to Airbrake severity levels.                                        |

#### `log(info: LogEntry & { stack?: string }, callback: () => void): void`

- **info**: The log entry object, possibly including a `stack` property.
- **callback**: Function to call when logging is complete.
- **Behavior**:
  - Emits the `"logged"` event as required by Winston.
  - Converts the log entry to an `Error` object if necessary.
  - Checks if the error message should be ignored (matches any substring in `ignoredErrorMessages`).
  - If not ignored and `AIRBRAKE_PROJECT_ID` is set in the environment, sends the error to Airbrake.
  - Calls the callback when done.

#### `private toSeverity(level: string): "error" | "warning" | "info"`

- **level**: The Winston log level.
- **Returns**: The corresponding Airbrake severity level.
  - `"error"` for `"error"`, `"crit"`, or `"fatal"`
  - `"warning"` for `"warn"` or `"warning"`
  - `"info"` for all other levels

## Example

```typescript
import winston from "winston";
import { AirbrakeTransport, AirbrakeTransportOptions } from "@policysynth/agents/base/winstonAirbrake.js";

const airbrakeOptions: AirbrakeTransportOptions = {
  projectId: 123456,
  projectKey: "your-airbrake-project-key",
  environment: "production",
  ignoredErrorMessages: ["MinorError", "NonCritical"]
};

const logger = winston.createLogger({
  level: "error",
  transports: [
    new AirbrakeTransport(airbrakeOptions)
  ]
});

// Example usage
logger.error("Critical failure: database unreachable");
logger.error(new Error("MinorError: this will be ignored"));
```

**Note:**  
- The transport only sends errors to Airbrake if the environment variable `AIRBRAKE_PROJECT_ID` is set.
- You can filter out specific error messages by providing substrings in `ignoredErrorMessages`.
- The transport supports all standard Winston transport options.