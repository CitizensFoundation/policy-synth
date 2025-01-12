import axios, { AxiosError } from "axios";
import qs from "qs";
import { PsAgent } from "../../dbModels/agent";
import { PsBaseIdeasCollaborationConnector } from "../base/baseIdeasCollaborationConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import fs from "fs";
import FormData from "form-data";

const MAX_RETRIES = 6*30;
const RETRY_DELAY = 10000;
const AI_IMAGE_GENERATION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/** Simple helper for waiting */
async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries the given request up to MAX_RETRIES times, when
 * either connection is refused (ECONNREFUSED) or a 5xx
 * HTTP error occurs.
 */
async function requestWithRetry<T>(requestFn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If the server is down or refused connection
        if (error.code === "ECONNREFUSED" ||
            error.code === "ECONNRESET" ||
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT" ||
            error.code === "EAI_AGAIN" ||
            error.code === "ENOTFOUND" ||
            error.code === "ENETUNREACH") {
          console.error(
            `${error.code}: Retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY}ms`
          );
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY);
            continue;
          }
        } else if (error.response && error.response.status >= 500) {
          console.error(
            `5xx Server Error: Retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY}ms`
          );
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY);
            continue;
          }
        } else {
          console.error("Other AXIOS error not retrying!:", error);
        }
      } else {
        console.error("Not Axios error:", error);
      }

      // If we get here, it’s not ECONNREFUSED or 5xx => re-throw
      throw error;
    }
  }

  // Exhausted all retries
  throw new Error(`Failed after ${MAX_RETRIES} retries.`);
}

export class PsYourPrioritiesConnector extends PsBaseIdeasCollaborationConnector {
  static readonly YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID =
    "1bfc3d1e-5f6a-7b8c-9d0e-1f2a3b4c5d6e";

  static readonly YOUR_PRIORITIES_CONNECTOR_VERSION = 7;

  static baseQuestions = [
    {
      uniqueId: "name",
      text: "Name",
      type: "textField",
      maxLength: 200,
      required: true,
    },
    {
      uniqueId: "description",
      text: "Description",
      type: "textArea",
      maxLength: 500,
      required: false,
    },
    {
      uniqueId: "groupId",
      text: "Your Priorities Group Id",
      type: "textField",
      subType: "number",
      maxLength: 7,
      required: true,
    },
  ] as YpStructuredQuestionData[];

  static loginQuestions = [
    {
      uniqueId: "serverBaseUrl",
      text: "Server Base URL",
      type: "textField",
      maxLength: 200,
      required: true,
    },
    {
      uniqueId: "userEmail",
      text: "User Email",
      type: "textField",
      maxLength: 200,
      required: true,
    },
    {
      uniqueId: "password",
      text: "Password",
      type: "textField",
      subType: "password",
      maxLength: 200,
      required: true,
    },
  ] as YpStructuredQuestionData[];

  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
    class_base_id: this.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID,
    name: "Ideas Collaboration",
    version: this.YOUR_PRIORITIES_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Ideas Collaboration",
      classType: PsConnectorClassTypes.IdeasCollaboration,
      hasPublicAccess: true,
      description: "Connector for Your Priorities Ideas Collaboration",
      imageUrl:
        "https://aoi-storage-production.citizens.is/dl/242cb3b51b2282f311b715af18203dc8--retina-1.png",
      iconName: "yourPriorities",
      questions: process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY
        ? this.baseQuestions
        : [...this.baseQuestions, ...this.loginQuestions],
    },
  };

  userEmail: string;
  password: string;
  serverBaseUrl: string;
  sessionCookie?: string;
  user?: YpUserData;
  agentFabricUserId?: number;

  constructor(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number = 0,
    endProgress: number = 100
  ) {
    super(connector, connectorClass, agent, memory, startProgress, endProgress);

    this.userEmail = this.getConfig("userEmail", "");
    this.password = this.getConfig("password", "");
    this.serverBaseUrl = this.getConfig("serverBaseUrl", "");

    const groupId = this.getConfig("groupId", "");

    if (process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH) {
      this.serverBaseUrl = `${process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH}/api`;
      this.agentFabricUserId = agent.user_id;
    }

    if (
      !process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY &&
      (!this.userEmail || !this.password || !this.serverBaseUrl)
    ) {
      throw new Error("Required configuration values are not set.");
    } else if (!groupId || !this.serverBaseUrl) {
      throw new Error("Group ID and serverBaseUrl is required.");
    }

    console.log(
      `Your Priorities Connector created with group ID: ${groupId} serverBaseUrl: ${this.serverBaseUrl}`
    );
  }

  // req.headers["x-api-key"] ===

  async login(): Promise<void> {
    if (!process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY) {
      if (!this.user) {
        console.log("Logging in to Your Priorities...");
        const loginData = {
          username: this.userEmail,
          password: this.password,
          email: this.userEmail,
          identifier: this.userEmail,
        };

        try {
          const response = await requestWithRetry(() =>
            axios.post(`${this.serverBaseUrl}/users/login`, loginData, {
              withCredentials: true,
            })
          );

          if (response) {
            this.user = response.data;
            const setCookieHeader = response.headers["set-cookie"];
            if (setCookieHeader) {
              this.sessionCookie = setCookieHeader.join("; ");
            } else {
              throw new Error("Login failed, no session cookie received.");
            }
          } else {
            throw new Error("Login failed, no response received.");
          }
        } catch (error) {
          console.error("Error during login:", error);
          throw new Error("Login failed.");
        }
      }
    } else {
      this.logger.info("Using Fabric Group API Key for Your Priorities login.");
    }
  }

  getHeaders() {
    if (process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY) {
      return {
        "x-api-key": process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY,
      };
    } else {
      return {
        Cookie: this.sessionCookie,
      };
    }
  }

  async getGroupPosts(groupId: number): Promise<YpPostData[]> {
    await this.login();

    let posts: YpPostData[] = [];
    let offset = 0;
    const limit = 20;
    let isMorePosts = true;

    const filter: "random" | "newest" | "top" = "top";
    const categoryId = "null";
    const statusFilter = "open";

    while (isMorePosts) {
      let url = `${this.serverBaseUrl}/groups/${groupId}/posts/${filter}/${categoryId}/${statusFilter}?offset=${offset}`;

      if (this.agentFabricUserId) {
        url += `&agentFabricUserId=${this.agentFabricUserId}`;
      }

      try {
        const response = await requestWithRetry(() =>
          axios.get(url, {
            headers: this.getHeaders(),
          })
        );

        const data = response.data.posts as YpPostData[];
        posts = posts.concat(data);

        if (data.length < limit) {
          isMorePosts = false;
        } else {
          offset += data.length;
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Failed to fetch group posts.");
      }
    }

    return posts;
  }

  async vote(postId: number, value: number): Promise<void> {
    console.log("Voting on post...");

    const votingData = {
      post_id: postId,
      value: value,
    };

    try {
      const response = await requestWithRetry(() =>
        axios.post(
          `${this.serverBaseUrl}/posts/${postId}/endorse${
            this.agentFabricUserId
              ? `?agentFabricUserId=${this.agentFabricUserId}`
              : ""
          }`,
          votingData,
          {
            headers: this.getHeaders(),
          }
        )
      );

      if (!response) {
        throw new Error("Voting Failed");
      }
    } catch (error) {
      console.error("Error during voting:", error);
      throw new Error("Voting failed.");
    }
  }

  async post(
    groupId: number,
    name: string,
    structuredAnswersData: YpStructuredAnswer[],
    imagePrompt: string,
    imageLocalPath: string | undefined = undefined
  ): Promise<YpPostData> {
    await this.login();

    const formData: any = {
      name: name,
      structuredAnswersJson: JSON.stringify(structuredAnswersData),
      postBaseId: "123",
      postValCode: "123",
      postConf: "0.0",
      userLocale: "en",
      screenWidth: "0",
      location: "",
      coverMediaType: "image",
    };

    let imageId: number;

    if (imageLocalPath) {
      // If we have a local image path, upload it using the /api/images endpoint
      const imageForm = new FormData();
      imageForm.append("file", fs.createReadStream(imageLocalPath), "image.png");

      try {
        const imageUploadResponse = await requestWithRetry(() =>
          axios.post(
            `${this.serverBaseUrl}/images${
              this.agentFabricUserId
                ? `?agentFabricUserId=${this.agentFabricUserId}`
                : ""
            }`,
            imageForm,
            {
              headers: {
                ...this.getHeaders(),
                ...imageForm.getHeaders(),
              },
            }
          )
        );

        if (!imageUploadResponse.data || !imageUploadResponse.data.id) {
          throw new Error("Image upload failed, no imageId received.");
        }

        this.logger.info(
          "Image uploaded successfully:",
          imageUploadResponse.data
        );

        imageId = imageUploadResponse.data.id;
      } catch (error) {
        console.error("Error uploading local image:", error);
        console.log("Generating AI image with prompt:", imagePrompt);
        imageId = await this.generateImageWithAi(groupId, imagePrompt);
      }
    } else {
      // No local image provided, generate an AI image instead
      imageId = await this.generateImageWithAi(groupId, imagePrompt);
    }

    if (imageId) {
      formData.uploadedHeaderImageId = imageId.toString();
    } else {
      console.warn("Skipping image setting, no imageId received.");
    }

    try {
      console.log(`Posting data to groupId ${groupId}:`, formData);

      const postResponse = await requestWithRetry(() =>
        axios.post(
          `${this.serverBaseUrl}/posts/${groupId}${
            this.agentFabricUserId
              ? `?agentFabricUserId=${this.agentFabricUserId}`
              : ""
          }`,
          qs.stringify(formData),
          {
            headers: {
              ...this.getHeaders(),
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
      );

      return postResponse.data;
    } catch (error) {
      console.error("Error posting data:", error);
      throw new Error("Failed to post data after multiple attempts.");
    }
  }

  async generateImageWithAi(groupId: number, prompt: string): Promise<number> {
    await this.login();

    try {
      console.log("Generating AI image with prompt:", prompt);
      const startResponse = await requestWithRetry(() =>
        axios.post(
          `${this.serverBaseUrl}/groups/${groupId}/start_generating/ai_image`,
          {
            imageType: "logo",
            prompt: prompt,
          },
          {
            headers: this.getHeaders(),
          }
        )
      );

      const { jobId } = startResponse.data;
      let isGenerating = true;
      let pollResponse;

      // Start timing for the 2-minute limit
      const startTime = Date.now();

      while (isGenerating) {
        pollResponse = await requestWithRetry(() =>
          axios.get(
            `${this.serverBaseUrl}/groups/${groupId}/${jobId}/poll_for_generating_ai_image`,
            { headers: this.getHeaders() }
          )
        );

        console.log("Poll response:", pollResponse.data);

        if (pollResponse.data.data.imageId) {
          isGenerating = false;
          console.log("AI image generated:", pollResponse.data.data.imageId);
        } else if (pollResponse.data.error) {
          isGenerating = false;
          console.error(
            "Error generating AI image:",
            pollResponse.data.data.error
          );
        }

        // If still generating, sleep 2s before next poll
        if (isGenerating) {
          // Check if we exceeded our 2-minute timeout
          if (Date.now() - startTime > AI_IMAGE_GENERATION_TIMEOUT_MS) {
            console.log(
              "AI image generation timed out after 2 minutes. Skipping image..."
            );
            return 0; // Will signal to skip the image
          }
          await sleep(2000);
        }
      }

      if (!pollResponse?.data?.data?.imageId) {
        throw new Error("Failed to generate AI image.");
      }

      return pollResponse.data.data.imageId;
    } catch (error) {
      console.error("Error generating AI image:", error);
      throw new Error("Failed to generate AI image.");
    }
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    if (process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY) {
      return [];
    } else {
      return [
        {
          uniqueId: "serverBaseUrl",
          text: "Server Base URL",
          type: "textField",
          maxLength: 200,
          required: true,
        },
        {
          uniqueId: "userEmail",
          text: "User Email",
          type: "textField",
          maxLength: 200,
          required: true,
        },
        {
          uniqueId: "password",
          text: "Password",
          type: "password",
          maxLength: 200,
          required: true,
        },
      ];
    }
  }
}
