import axios from "axios";

async function updateWebPageSchema() {
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
  } catch (error: any) {
    // Print generic error message
    console.error(`Error updating schema: ${error.message}`);

    // Print Axios-specific error details
    if (error.response) {
      // The request was made, and the server responded with a status code that falls out of the range of 2xx
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Axios error:', error.message);
    }

    // Log the complete error object in case there's more information
    console.error('Error object:', error);
  }

}

updateWebPageSchema();
