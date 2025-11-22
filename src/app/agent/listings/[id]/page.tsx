import { notFound } from "next/navigation";
import { getListingById } from "@/lib/actions/agent";
import { ListingForm } from "@/components/agent/listing-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Listing — Agent",
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) notFound();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the details of your property listing
        </p>
      </div>
      <ListingForm mode="edit" listing={listing} />
    </div>
  );
}
