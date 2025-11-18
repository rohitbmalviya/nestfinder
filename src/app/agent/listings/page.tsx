export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { getMyListings } from "@/lib/actions/agent";
import { Button } from "@/components/ui/button";
import { AgentListingsTable } from "@/components/agent/agent-listings-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Listings — Agent",
};

export default async function AgentListingsPage() {
  const listings = await getMyListings();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} total
          </p>
        </div>
        <Link href="/agent/listings/new">
          <Button className="gap-1.5">
            <Plus size={16} />
            New Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any listings yet.
          </p>
          <Link href="/agent/listings/new">
            <Button>
              <Plus size={16} className="mr-1.5" />
              Create Your First Listing
            </Button>
          </Link>
        </div>
      ) : (
        <AgentListingsTable listings={listings} />
      )}
    </div>
  );
}
