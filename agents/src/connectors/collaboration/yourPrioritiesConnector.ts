import axios from "axios";
import qs from "qs";
import { PsAgentConnector } from "../../dbModels/agentConnector";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass";
import { PsAgent } from "../../dbModels/agent";
import { PsBaseConnector } from "../base/baseConnector.js";

export class PsYourPrioritiesConnector extends PsBaseConnector {
  private static readonly YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID =
    "1bfc3d1e-5f6a-7b8c-9d0e-1f2a3b4c5d6e";

  private static readonly YOUR_PRIORITIES_CONNECTOR_VERSION = 1;

  static getConnectorClass = {
    created_at: new Date(),
    updated_at: new Date(),
    class_base_id: this.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID,
    name: "Your Priorities",
    version: this.YOUR_PRIORITIES_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Your Priorities",
      description: "Connector for Your Priorities",
      imageUrl:
        "https://aoi-storage-production.citizens.is/ypGenAi/community/1/0a10f369-185b-40dc-802a-c2d78e6aab6d.png",
      iconName: "yourPriorities",
      questions: [
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
      ],
    },
  };

  private userEmail: string;
  private password: string;
  private serverBaseUrl: string;
  private sessionCookie?: string;
  private user?: YpUserData;

  constructor(
    connector: PsAgentConnector,
    connectorClass: PsAgentConnectorClass,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number = 0,
    endProgress: number = 100
  ) {
    super(connector, connectorClass, agent, memory, startProgress, endProgress);

    this.userEmail = this.getConfig("userEmail", "");
    this.password = this.getConfig("password", "");
    this.serverBaseUrl = this.getConfig("serverBaseUrl", "");

    if (!this.userEmail || !this.password || !this.serverBaseUrl) {
      throw new Error("Required configuration values are not set.");
    }
  }

  private async login(): Promise<void> {
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
  }

  private async vote(postId: number, value: number): Promise<void> {
    console.log("Voting on post...");
    const votingData = {
      post_id: postId,
      value: value,
    };

    try {
      const response = await axios.post(
        `${this.serverBaseUrl}/posts/${postId}/endorse`,
        votingData,
        {
          headers: {
            Cookie: this.sessionCookie,
          },
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

  async post(groupId: number, postData: any, imagePrompt: string): Promise<YpPostData> {
    await this.login();

    const imageId = await this.generateImageWithAi(groupId, imagePrompt);
    postData.uploadedHeaderImageId = imageId.toString();

    console.log("Posting data:", postData);

    try {
      const postResponse = await axios.post(
        `${this.serverBaseUrl}/posts/${groupId}`,
        qs.stringify(postData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: this.sessionCookie,
          },
        }
      );

      const responseData = postResponse.data;

      if (postData.eloRating && postData.eloRating < 1000) {
        await this.vote(responseData.id, -1);
      }

      return responseData;
    } catch (error) {
      console.error("Error posting data:", error);
      throw new Error("Failed to post data.");
    }
  }

  private async generateImageWithAi(groupId: number, prompt: string): Promise<number> {
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
          headers: {
            Cookie: this.sessionCookie,
          },
        }
      );

      const { jobId } = startResponse.data;

      let isGenerating = true;
      let pollResponse;

      while (isGenerating) {
        pollResponse = await axios.get(
          `${this.serverBaseUrl}/groups/${groupId}/${jobId}/poll_for_generating_ai_image`,
          {
            headers: {
              Cookie: this.sessionCookie,
            },
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