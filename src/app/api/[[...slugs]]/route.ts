import { swagger } from "@elysiajs/swagger";
import { getMainnetRpcProvider, view } from "@near-js/client";
import { Elysia } from "elysia";
import {
  Transaction,
  buildTransaction,
  calculateDepositByDataSize,
  validateNearAddress,
} from "@wpdas/naxios";
import { parseNearAmount } from "@near-js/utils";

// Define the SocialTransactionType interface
interface SocialTransactionType {
  // Add properties according to your requirements
  receiverId: string;
  args: any; // Replace 'any' with the actual type if known
  deposit: string; // Assuming deposit is a string, adjust if necessary
}

enum RegistrationStatus {
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  Graylisted = "Graylisted",
  Blacklisted = "Blacklisted",
  Unregistered = "Unregistered",
}
export interface Registration {
  id: string;
  registrant_id: string;
  list_id: number;
  status: RegistrationStatus;
  submitted_ms: number;
  updated_ms: number;
  admin_notes: null | string;
  registrant_notes: null | string;
  registered_by: string;
}

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/project/:projectId", async ({ params: { projectId } }) => {
    try {
      const registrations = await view<Registration[]>({
        account: "lists.potlock.near",
        method: "get_registrations_for_registrant",
        args: {
          registrant_id: projectId,
        },
        deps: { rpcProvider: getMainnetRpcProvider() },
      });
      return registrations;
    } catch (e: any) {
      console.error(e);
      return [];
    }
  })
  .post("/project/create", {
    schema: {
      body: {
        type: "object",
        properties: {
          mbMetadata: {
            type: "object",
            properties: {
              accountData: {
                type: "object",
                properties: {
                  accountId: { type: "string" },
                },
              },
            },
            required: ["accountData"],
          },
        },
        required: ["mbMetadata"],
      },
    },
    handler: async ({
      body,
    }: {
      body: { mbMetadata?: { accountData?: { accountId: string } } };
    }) => {
      console.log("Received body:", body); // Log the incoming body for debugging

      if (
        !body ||
        !body.mbMetadata ||
        !body.mbMetadata.accountData ||
        !body.mbMetadata.accountData.accountId
      ) {
        return { error: "Invalid mb-metadata format" }; // Return an error response
      }
      const mbMetadata = body.mbMetadata;

      if (
        !mbMetadata ||
        !mbMetadata.accountData ||
        !mbMetadata.accountData.accountId
      ) {
        return { error: "Invalid mb-metadata format" }; // Return an error response
      }

      // Social Data Format
      const socialData = getSocialDataFormat(data);

      // If there is an existing social data, make the diff between then
      const existingSocialData = await getSocialData(accountId);

      const diff = existingSocialData
        ? deepObjectDiff(existingSocialData, socialData)
        : socialData;

      const accountId = mbMetadata.accountData.accountId;

      const socialArgs = {
        data: {
          [accountId]: diff,
        },
      };

      let depositFloat = calculateDepositByDataSize(socialArgs);
      if (!accountId) {
        depositFloat = (Number(depositFloat) + 0.1).toString();
      }

      // social.near
      const socialTransaction = await view<SocialTransactionType[]>({
        account: "social.near",
        method: "set",
        args: {
          receiverId: "social.near",
          args: socialArgs,
          deposit: parseNearAmount(depositFloat)!,
        },
        deps: { rpcProvider: getMainnetRpcProvider() }, // Added deps property
      });

      return {
        id: "myproject.near",
        name: "test",
        description: "heyyyyyy",
        functionCalls: [
          {
            methodName: "init",
            args: {
              name: "My List Name",
              description: "This is a description", // Replace with the actual description
              cover_image_url: null, // Optional, replace with actual URL if needed
              admins: null, // Optional, replace with actual admin accounts if needed
              default_registration_status: RegistrationStatus.Pending, // Set the default status
              admin_only_registrations: null, // Optional, replace with true/false if needed
            },
          },
        ],
      };
    },
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;
