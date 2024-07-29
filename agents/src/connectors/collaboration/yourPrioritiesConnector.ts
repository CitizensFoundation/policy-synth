import axios from "axios";
import qs from "qs";
import { PsAgent } from "../../dbModels/agent";
import { PsBaseIdeasCollaborationConnector } from "../base/baseIdeasCollaborationConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";

export class PsYourPrioritiesConnector extends PsBaseIdeasCollaborationConnector {
  static readonly YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID =
    "1bfc3d1e-5f6a-7b8c-9d0e-1f2a3b4c5d6e";

  static readonly YOUR_PRIORITIES_CONNECTOR_VERSION = 4;

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
    name: "Your Priorities",
    version: this.YOUR_PRIORITIES_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Your Priorities",
      classType: PsConnectorClassTypes.IdeasCollaboration,
      hasPublicAccess: true,
      description: "Connector for Your Priorities",
      imageUrl:
        "https://aoi-storage-production.citizens.is/ypGenAi/community/1/0a10f369-185b-40dc-802a-c2d78e6aab6d.png",
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

    try {
      const imageId = await this.generateImageWithAi(groupId, imagePrompt);
      formData.uploadedHeaderImageId = imageId.toString();

      console.log("Posting data:", formData);

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

      const responseData = postResponse.data;

      return responseData;
    } catch (error) {
      console.error("Error posting data:", error);
      throw new Error("Failed to post data.");
    }
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
