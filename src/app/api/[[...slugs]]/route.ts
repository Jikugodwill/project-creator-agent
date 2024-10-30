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

      return registrations.map(reg => ({
        ...reg,
        submitted_ms: {
          timeAgo: formatTimeAgo(reg.submitted_ms),
          date: formatPreciseDate(reg.submitted_ms)
        },
        updated_ms: {
          timeAgo: formatTimeAgo(reg.updated_ms),
          date: formatPreciseDate(reg.updated_ms)
        }
      }));
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

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

function formatPreciseDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
