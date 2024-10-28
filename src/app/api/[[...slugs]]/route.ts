import { CreateOrUpdateProjectHandler } from "@/utils/handleCreateOrUpdateProject";
import { swagger } from "@elysiajs/swagger";
import { getMainnetRpcProvider, view } from "@near-js/client";
import { Elysia } from "elysia";

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
  .post(
    "/project/create",
    async ({ headers }) => {
      const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}");
      const accountId = mbMetadata?.accountData?.accountId?? "jgodwill.near";
      
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
    }
  )
  .compile();

export const GET = app.handle;
export const POST = app.handle;
