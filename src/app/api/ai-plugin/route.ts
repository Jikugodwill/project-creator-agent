import { NextResponse } from "next/server";

const key = JSON.parse(process.env.BITTE_KEY || "{}");
const config = JSON.parse(process.env.BITTE_CONFIG || "{}");

if (!key?.accountId) {
  console.error("no account");
}

export async function GET() {
  const pluginData = {
    openapi: "3.0.0",
    info: {
      title: "Potlock API",
      description:
        "API for interacting with Potlock operations including project retrieval and creation.",
      version: "1.0.0",
    },
    servers: [
      {
        url: config.url,
      },
    ],
    "x-mb": {
      "account-id": key.accountId,
      assistant: {
        name: "Potlock Project Genie",
        description:
          "Assistant for using the Potlock API to create projects and retrieve project data.",
        instructions:
          "You are an assistant that helps users interact with Potlock. You can generate register project transactions and retrieve project data. Generated transactions can be presented to the user for signing and broadcasting to the network.",
        tools: [
          {
            type: "generate-transaction",
          },
        ],
      },
    },
    paths: {
      "/api/project/{projectId}": {
        get: {
          description: "Fetch data for a specific project by identifier.",
          operationId: "get-project-data",
          parameters: [
            {
              in: "path",
              name: "projectId",
              required: true,
              schema: {
                type: "string",
              },
              description:
                "The identifier of the project to retrieve data for.",
            },
          ],
          responses: {
            "200": {
              description: "Project data retrieved successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        description: "Unique identifier for the project.",
                      },
                      registrant_id: {
                        type: "string",
                        description: "The identifier of the registrant.",
                      },
                      list_id: {
                        type: "integer",
                        description: "Identifier for the registration list.",
                      },
                      status: {
                        type: "string",
                        description: "Current registration status.",
                        enum: [
                          "Approved",
                          "Rejected",
                          "Pending",
                          "Graylisted",
                          "Blacklisted",
                          "Unregistered",
                        ],
                      },
                      submitted_ms: {
                        type: "object",
                        properties: {
                          timeAgo: {
                            type: "string",
                            description: "Time since submission.",
                          },
                          date: {
                            type: "string",
                            description: "Submission date.",
                          },
                        },
                      },
                      updated_ms: {
                        type: "object",
                        properties: {
                          timeAgo: {
                            type: "string",
                            description: "Time since last update.",
                          },
                          date: {
                            type: "string",
                            description: "Last update date.",
                          },
                        },
                      },
                      admin_notes: {
                        type: "string",
                        description: "Optional notes added by the admin.",
                        nullable: true,
                      },
                      registrant_notes: {
                        type: "string",
                        description: "Optional notes added by the registrant.",
                        nullable: true,
                      },
                      registered_by: {
                        type: "string",
                        description:
                          "Identifier for the user or system that registered the entity.",
                      },
                      profile_data: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Name of the project.",
                          },
                          description: {
                            type: "string",
                            description: "Description of the project.",
                          },
                          linktree: {
                            type: "object",
                            properties: {
                              github: { type: "string" },
                              website: { type: "string" },
                              twitter: { type: "string" },
                              telegram: { type: "string" },
                            },
                          },
                          image: {
                            type: "object",
                            properties: {
                              ipfs_cid: {
                                type: "string",
                                description: "IPFS CID for the project image.",
                              },
                            },
                          },
                          tags: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                          backgroundImage: {
                            type: "object",
                            properties: {
                              ipfs_cid: {
                                type: "string",
                                description:
                                  "IPFS CID for the background image.",
                              },
                            },
                          },
                          horizon_tnc: {
                            type: "string",
                            description: "Terms and conditions acceptance.",
                          },
                          verticals: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                          product_type: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                          stage: {
                            type: "string",
                            description: "Current stage of the project.",
                          },
                          team: {
                            type: "object",
                            additionalProperties: { type: "string" },
                          },
                          tagline: {
                            type: "string",
                            description: "Tagline for the project.",
                          },
                          website: {
                            type: "string",
                            description: "Website URL for the project.",
                          },
                          category: {
                            type: "object",
                            properties: {
                              text: {
                                type: "string",
                                description: "Category text.",
                              },
                              value: {
                                type: "string",
                                description: "Category value.",
                              },
                            },
                          },
                        },
                      },
                    },
                    required: [
                      "id",
                      "registrant_id",
                      "list_id",
                      "status",
                      "submitted_ms",
                      "updated_ms",
                      "registered_by",
                      "profile_data",
                    ],
                  },
                },
              },
            },
            "404": {
              description: "Project not found.",
            },
          },
        },
      },
      "/api/project/create": {
        post: {
          summary: "Create a new project",
          description:
            "Create a new project by providing the project name and description.",
          operationId: "createProject",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The name of the project to be created.",
                    },
                    description: {
                      type: "string",
                      description: "A brief description of the project.",
                    },
                  },
                  required: ["name", "description"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Project transactions generated successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description:
                            "The identifier of the newly created project.",
                        },
                        name: {
                          type: "string",
                          description: "The name of the newly created project.",
                        },
                        description: {
                          type: "string",
                          description:
                            "The description of the newly created project.",
                        },
                        functionCalls: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              methodName: {
                                type: "string",
                                description:
                                  "The name of the method to be called on the contract.",
                              },
                              args: {
                                type: "object",
                                description: "Arguments for the function call.",
                                properties: {
                                  registration_only: {
                                    type: "boolean",
                                  },
                                  account_id: {
                                    type: "string",
                                  },
                                  receiver_id: {
                                    type: "string",
                                  },
                                  amount: {
                                    type: "string",
                                  },
                                  msg: {
                                    type: "string",
                                    description:
                                      "A JSON string containing project actions and parameters.",
                                  },
                                },
                                additionalProperties: true,
                              },
                              gas: {
                                type: "string",
                                description:
                                  "The amount of gas to attach to the transaction, in yoctoNEAR.",
                              },
                              amount: {
                                type: "string",
                                description:
                                  "The amount of NEAR tokens to attach to the transaction, in yoctoNEAR.",
                              },
                            },
                            required: ["methodName", "args", "gas", "amount"],
                          },
                        },
                      },
                      required: ["receiverId", "functionCalls"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return NextResponse.json(pluginData);
}
