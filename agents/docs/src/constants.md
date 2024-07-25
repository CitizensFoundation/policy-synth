# PsConstants

The `PsConstants` class provides a set of static constants used throughout the application. These constants include cache expiration times, timeouts, and user agent strings.

## Properties

| Name                      | Type   | Description                                                                 |
|---------------------------|--------|-----------------------------------------------------------------------------|
| getPageCacheExpiration    | number | The cache expiration time for pages, set to 6 months (in seconds).          |
| webPageNavTimeout         | number | The timeout duration for web page navigation, set to 30 seconds (in milliseconds). |
| currentUserAgent          | string | The user agent string used for web requests.                                |

## Example

```typescript
import { PsConstants } from '@policysynth/agents/constants.js';

// Accessing the constants
const cacheExpiration = PsConstants.getPageCacheExpiration;
const navTimeout = PsConstants.webPageNavTimeout;
const userAgent = PsConstants.currentUserAgent;

console.log(`Cache Expiration: ${cacheExpiration} seconds`);
console.log(`Navigation Timeout: ${navTimeout} milliseconds`);
console.log(`User Agent: ${userAgent}`);
```

This class is useful for maintaining consistent configuration values across different parts of the application.