import { CreateOrUpdateProjectHandler } from "@/utils/handleCreateOrUpdateProject";
import { swagger } from "@elysiajs/swagger";
import { getMainnetRpcProvider, view } from "@near-js/client";
import { Elysia } from "elysia";

import {
  formatTimeAgo,
  formatPreciseDate,
  getSocialDataFormat,
} from "@/utils";
import { NEARSocialUserProfile } from "@/common/social";

enum RegistrationStatus {
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  Graylisted = "Graylisted",
  Blacklisted = "Blacklisted",
  Unregistered = "Unregistered",
}

interface SocialDataType {
  args: any; // Replace 'any' with the actual type if known
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
  .get("/project/:projectId", async ({ params: { projectId }, headers }) => {
    try {
      console.log("1. Starting request for projectId:", projectId);
      const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
      const accountId = mbMetadata?.accountData?.accountId ?? projectId;
      console.log("2. AccountId:", accountId);

      const registrations = await view<Registration[]>({
        account: "lists.potlock.near",
        method: "get_registrations_for_registrant",
        args: {
          registrant_id: projectId,
        },
        deps: { rpcProvider: getMainnetRpcProvider() },
      });
      console.log("3. Registrations:", registrations);

      const results = await Promise.all(
        registrations.map(async (reg) => {
          console.log("4. Processing registration:", reg.id);
          const profileData = await view<Record<string, { profile: NEARSocialUserProfile }>>({
            account: "social.near",
            method: "get",
            args: {
              keys: [`${accountId}/profile/**`]
            },
            deps: { rpcProvider: getMainnetRpcProvider() }
          });

          const profile = profileData?.[accountId]?.profile;

          console.log("5. Profile data for reg:", reg.id, profile);

          return {
            ...reg,
            submitted_ms: {
              timeAgo: formatTimeAgo(reg.submitted_ms),
              date: formatPreciseDate(reg.submitted_ms),
            },
            updated_ms: {
              timeAgo: formatTimeAgo(reg.updated_ms),
              date: formatPreciseDate(reg.updated_ms),
            },
            profile_data: profile,
          };
        })
      );
      console.log("6. Final results:", results);
      return results;
    } catch (e: any) {
      console.error("Error in /project/:projectId:", e);
      return [];
    }
  })
  .post("/project/create", async ({ headers }) => {
    const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
    const accountId = mbMetadata?.accountData?.accountId ?? "jgodwill.near";

    if (!accountId) {
      return new Response("Account ID is required", { status: 400 });
    }

    try {
      const result = await CreateOrUpdateProjectHandler(accountId);

      if (!result?.success) {
        return new Response(result?.error || "Unknown error", { status: 500 });
      }

      return new Response("Project created successfully", { status: 200 });
    } catch (error) {
      console.error("Error creating project:", error);
      return new Response("Error creating project", { status: 500 });
    }
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;
