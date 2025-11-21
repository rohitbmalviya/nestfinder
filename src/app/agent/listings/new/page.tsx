import { ListingForm } from "@/components/agent/listing-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Listing — Agent",
};

export default function NewListingPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details to publish your property listing
        </p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
