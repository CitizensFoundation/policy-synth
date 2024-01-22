# Policy Synth WebApp API Documentation

This documentation provides a detailed overview of the classes, methods, properties, and events for the Policy Synth WebApp API.

## OpenAI

The `OpenAI` class is responsible for interacting with the OpenAI API.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| apiKey        | string | The API key for OpenAI.   |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| constructor | options: { apiKey: string } | OpenAI | Initializes a new instance of the OpenAI class with the provided options. |
| chat.completions.create | options: { model: string, temperature: number, max_tokens: number, messages: Array<{ role: string, content: string }> } | Promise<any> | Sends a request to the OpenAI API to create a chat completion based on the provided options. |

## Examples

```typescript
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getCompletion() {
  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4-1106-preview',
    temperature: 0.0,
    max_tokens: 4095,
    messages: [
      { role: 'system', content: 'Your system prompt here' },
      { role: 'user', content: 'Your user message here' },
    ],
  });
  console.log(completion.choices[0].message.content);
}

getCompletion();
```

---

Please note that the above code is a simplified example and may not cover all aspects of the `OpenAI` class. The actual implementation may include additional methods, properties, and error handling to ensure robust interaction with the OpenAI API.