import axios from "axios";
import { PsAgent } from "../../dbModels/agent";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsBaseVotingCollaborationConnector } from "../base/baseVotingCollaborationConnector.js";

export class PsAllOurIdeasConnector extends PsBaseVotingCollaborationConnector {
  private static readonly ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID =
    "aafcfd1a-3f6a-7b9c-3d0e-1f2a1b4c5d6e";

  private static readonly ALL_OUR_IDEAS_CONNECTOR_VERSION = 1;

  static getConnectorClass = {
    created_at: new Date(),
    updated_at: new Date(),
    class_base_id: this.ALL_OUR_IDEAS_CONNECTOR_CLASS_BASE_ID,
    name: "All Our Ideas",
    version: this.ALL_OUR_IDEAS_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "",
      classType: PsConnectorClassTypes.VotingCollaboration as string,
      description: "Connector for All Our Ideas",
      imageUrl:
        "https://aoi-storage-production.citizens.is/ypGenAi/community/1/30582554-20a7-4de5-87a4-4540dc2030b4.png",
      iconName: "allOurIdeas",
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
          uniqueId: "groupId",
          text: "All Our Ideas Group Id",
          type: "textField",
          subType: "number",
          maxLength: 7,
          required: true,
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
          type: "textField",
          subType: "password",
          maxLength: 200,
          required: true,
        },
      ],
    } as PsAgentConnectorConfiguration,
  };

  private userEmail: string;
  private password: string;
  private serverBaseUrl: string;
  private sessionCookie?: string;
  private user?: YpUserData;

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

    if (!this.userEmail || !this.password || !this.serverBaseUrl) {
      throw new Error("Required configuration values are not set.");
    }
  }

  async login(): Promise<void> {
    if (!this.user) {
      console.log("Logging in to All Our Ideas...");
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

  async vote(postId: number, value: number): Promise<void> {
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

  async postItems(groupId: number, itesm: []): Promise<boolean> {
    //TODO
    return false;
  }

}