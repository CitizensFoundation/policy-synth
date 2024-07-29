# PsRateLimitManager

The `PsRateLimitManager` class is responsible for managing rate limits for different models. It extends the `PolicySynthAgentBase` class and provides methods to update and check rate limits based on requests and tokens.

## Properties

| Name       | Type                    | Description                                      |
|------------|-------------------------|--------------------------------------------------|
| rateLimits | PsModelRateLimitTracking | Tracks the rate limits for different models.     |

## Methods

| Name              | Parameters                                      | Return Type | Description                                                                 |
|-------------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| updateRateLimits  | model: any, tokensToAdd: number                 | Promise<void> | Updates the rate limits for a given model by adding request timestamps and token entries. |
| checkRateLimits   | model: any, tokensToAdd: number                 | Promise<void> | Checks the rate limits for a given model and enforces limits by sleeping if necessary. |
| addRequestTimestamp | model: any                                    | void        | Adds a request timestamp for a given model.                                 |
| addTokenEntry     | model: any, tokensToAdd: number                 | void        | Adds a token entry for a given model.                                       |
| slideWindowForRequests | model: any                                 | void        | Slides the window for requests to remove old entries outside the time window. |
| slideWindowForTokens | model: any                                   | void        | Slides the window for tokens to remove old entries outside the time window. |

## Example

```typescript
import { PsRateLimitManager } from '@policysynth/agents/base/agentRateLimiter.js';

const rateLimitManager = new PsRateLimitManager();

// Example model object
const model = {
  name: 'exampleModel',
  limitRPM: 60, // Requests per minute
  limitTPM: 1000 // Tokens per minute
};

// Update rate limits
await rateLimitManager.updateRateLimits(model, 50);

// Check rate limits
await rateLimitManager.checkRateLimits(model, 50);
```

## Detailed Method Descriptions

### updateRateLimits

```typescript
async updateRateLimits(model: any, tokensToAdd: number): Promise<void>
```

Updates the rate limits for a given model by adding request timestamps and token entries.

- **Parameters:**
  - `model`: The model object containing rate limit information.
  - `tokensToAdd`: The number of tokens to add to the rate limit tracking.

### checkRateLimits

```typescript
async checkRateLimits(model: any, tokensToAdd: number): Promise<void>
```

Checks the rate limits for a given model and enforces limits by sleeping if necessary.

- **Parameters:**
  - `model`: The model object containing rate limit information.
  - `tokensToAdd`: The number of tokens to add to the rate limit tracking.

### addRequestTimestamp

```typescript
addRequestTimestamp(model: any): void
```

Adds a request timestamp for a given model.

- **Parameters:**
  - `model`: The model object containing rate limit information.

### addTokenEntry

```typescript
addTokenEntry(model: any, tokensToAdd: number): void
```

Adds a token entry for a given model.

- **Parameters:**
  - `model`: The model object containing rate limit information.
  - `tokensToAdd`: The number of tokens to add to the rate limit tracking.

### slideWindowForRequests

```typescript
slideWindowForRequests(model: any): void
```

Slides the window for requests to remove old entries outside the time window.

- **Parameters:**
  - `model`: The model object containing rate limit information.

### slideWindowForTokens

```typescript
slideWindowForTokens(model: any): void
```

Slides the window for tokens to remove old entries outside the time window.

- **Parameters:**
  - `model`: The model object containing rate limit information.