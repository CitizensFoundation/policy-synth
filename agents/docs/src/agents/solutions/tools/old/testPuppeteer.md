# puppeteer

Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. It is often used for web scraping, automated testing of web pages, and generating pre-rendered content.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| redis         | ioredis.Redis | Instance of Redis client.        |

## Methods

| Name                  | Parameters                                      | Return Type | Description                 |
|-----------------------|-------------------------------------------------|-------------|-----------------------------|
| getAndProcessPdf      | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | Promise<void> | Processes a PDF from a given URL and extracts text. |
| getAndProcessHtml     | subProblemIndex: number \| undefined, url: string, browserPage: Page, type: IEngineWebPageTypes | Promise<void> | Processes HTML content from a given URL and extracts text. |

## Examples

```typescript
import puppeteer, { Page } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import ioredis from "ioredis";

// Initialize puppeteer with StealthPlugin
puppeteer.use(StealthPlugin());

// Example usage of puppeteer to process a PDF or HTML page
puppeteer.launch({ headless: true }).then(async (browser) => {
  const page = await browser.newPage();
  let url = "https://example.com/somepage.pdf";

  if (url.endsWith(".pdf")) {
    await getAndProcessPdf(1, url, page, "general");
  } else {
    await getAndProcessHtml(1, url, page, "general");
  }

  await browser.close();
});
```

# ioredis

ioredis is a robust, performance-focused, and full-featured Redis client for Node.js.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```typescript
import ioredis from "ioredis";

// Example usage of ioredis to connect to a Redis server
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

// Set a value in Redis
redis.set("key", "value");

// Get a value from Redis
redis.get("key").then((value) => {
  console.log(value);
});
```

# PdfReader

PdfReader is a Node.js module to read and parse PDF files.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```typescript
import { PdfReader } from "pdfreader";

// Example usage of PdfReader to parse a PDF buffer
new PdfReader().parseBuffer(pdfBuffer, function (err, item) {
  if (err) {
    console.error(err);
  } else if (!item) {
    // End of file
  } else if (item.text) {
    console.log(item.text);
  }
});
```

# axios

Axios is a promise-based HTTP client for the browser and Node.js.

## Properties

No properties documented.

## Methods

No methods documented.

## Examples

```typescript
import axios from "axios";

// Example usage of axios to perform a GET request
axios.get('https://api.example.com/data')
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
```

Please note that the above documentation is a simplified version and does not cover all the functionalities of the mentioned libraries. For comprehensive documentation, refer to the official documentation of each library.