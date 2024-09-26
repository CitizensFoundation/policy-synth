import axios, { AxiosError } from "axios";
import qs from "qs";
import { PsAgent } from "../../dbModels/agent";
import { PsBaseIdeasCollaborationConnector } from "../base/baseIdeasCollaborationConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";

const MAX_RETRIES = 7;
const RETRY_DELAY = 1000; // 1 second

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
          const response = await axios.post(
            `${this.serverBaseUrl}/users/login`,
            loginData,
            {
              withCredentials: true,
            }
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

    const filter = "newest";
    const categoryId = "null";
    const statusFilter = "open";

    while (isMorePosts) {
      let url = `${this.serverBaseUrl}/groups/${groupId}/posts/${filter}/${categoryId}/${statusFilter}?offset=${offset}`;

      if (this.agentFabricUserId) {
        url += `&agentFabricUserId=${this.agentFabricUserId}`;
      }

      try {
        const response = await axios.get(url, {
          headers: this.getHeaders(),
        });
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
      const response = await axios.post(
        `${this.serverBaseUrl}/posts/${postId}/endorse${
          this.agentFabricUserId
            ? `?agentFabricUserId=${this.agentFabricUserId}`
            : ""
        }`,
        votingData,
        {
          headers: this.getHeaders(),
        }
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
    imagePrompt: string
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

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const imageId = await this.generateImageWithAi(groupId, imagePrompt);
        formData.uploadedHeaderImageId = imageId.toString();

        console.log(`Attempt ${attempt}: Posting data:`, formData);

        const postResponse = await axios.post(
          `${this.serverBaseUrl}/posts/${groupId}${
            this.agentFabricUserId
              ? `?agentFabricUserId=${this.agentFabricUserId}`
              : ""
          }`,
          qs.stringify(formData),
          {
            headers: {
              ...this.getHeaders(),
              ...{
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          }
        );

        return postResponse.data;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === MAX_RETRIES) {
          console.error("Max retries reached. Throwing final error.");
          throw new Error("Failed to post data after multiple attempts.");
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.status >= 500) {
            console.log(`Server error (5xx). Retrying in ${RETRY_DELAY}ms...`);
            await sleep(RETRY_DELAY);
            continue;
          }
        }

        throw error; // Rethrow if it's not a 5xx error
      }
    }

    // This line should never be reached due to the loop structure,
    // but TypeScript might expect a return statement here
    throw new Error("Unexpected end of post method");

  }

  async generateImageWithAi(groupId: number, prompt: string): Promise<number> {
    await this.login();

    try {
      console.log("Generating AI image with prompt:", prompt);
      const startResponse = await axios.post(
        `${this.serverBaseUrl}/groups/${groupId}/start_generating/ai_image`,
        {
          imageType: "logo",
          prompt: prompt,
        },
        {
          headers: this.getHeaders(),
        }
      );

      const { jobId } = startResponse.data;

      let isGenerating = true;
      let pollResponse;

      while (isGenerating) {
        pollResponse = await axios.get(
          `${this.serverBaseUrl}/groups/${groupId}/${jobId}/poll_for_generating_ai_image`,
          {
            headers: this.getHeaders(),
          }
        );

        console.log("Poll response:", pollResponse.data);

        if (pollResponse.data.data.imageId) {
          isGenerating = false;
          console.log("AI image generated:", pollResponse.data.data.imageId);
        } else if (pollResponse.data.error) {
          isGenerating = false;
          console.error("Error generating AI image:", pollResponse.data.data.error);
        }

        if (isGenerating) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      return pollResponse!.data.data.imageId;
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
