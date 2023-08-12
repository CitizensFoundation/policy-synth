import axios from "axios";

async function updateWebPageSchema() {
  // Define the URL and payload
  const url = `${
    process.env.WEAVIATE_HOST || "http://localhost:8080"
  }/v1/schema/WebPage`;
  const payload = {
    class: "WebPage",
    invertedIndexConfig: {
      indexPropertyLength: true,
      indexNullState: true,
    },
  };

  try {
    // Make the HTTP PUT request
    const response = await axios.put(url, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Log the response or handle it as needed
    console.log(response.data);
  } catch (error) {
    console.error(`Error updating schema: ${error}`);
  }
}

updateWebPageSchema();
