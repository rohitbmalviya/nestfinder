export const dynamic = "force-dynamic";

import { getMyEnquiries } from "@/lib/actions/agent";
import { AgentEnquiriesClient } from "@/components/agent/agent-enquiries-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enquiries — Agent",
};

export default async function AgentEnquiriesPage() {
  const enquiries = await getMyEnquiries();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {enquiries.length} total enquiries
        </p>
      </div>
      <AgentEnquiriesClient enquiries={enquiries} />
    </div>
  );
}
