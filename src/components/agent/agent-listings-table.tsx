"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteListing } from "@/lib/actions/agent";
import { formatPaiseCompact } from "@/lib/payments";
import { format } from "date-fns";
import type { AgentListing } from "@/lib/actions/agent";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

function statusStyle(status: string) {
  if (status === "ACTIVE") {
    return { bg: "oklch(0.60 0.18 145)", color: "oklch(0.97 0 0)", label: "Active" };
  }
  if (status === "SOLD") {
    return { bg: "oklch(0.72 0.14 68)", color: "oklch(0.12 0.04 68)", label: "Sold" };
  }
  return { bg: "oklch(0.52 0.14 230)", color: "oklch(0.97 0 0)", label: "Rented" };
}

interface AgentListingsTableProps {
  listings: AgentListing[];
}

export function AgentListingsTable({ listings }: AgentListingsTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string, title: string) {
    if (
      !confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)
    ) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        const result = await deleteListing(id);
        if (result.success) {
          toast.success("Listing deleted successfully");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to delete listing");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enquiries</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const statusInfo = statusStyle(listing.status);
            const isDeleting = deletingId === listing.id;
            return (
              <TableRow key={listing.id} className={isDeleting ? "opacity-50" : ""}>
                <TableCell className="max-w-52">
                  <div className="font-medium truncate">{listing.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {listing.city}, {listing.state}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit text-xs">
                      {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                    </Badge>
                    <span
                      className="inline-flex w-fit items-center rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
                      style={
                        listing.listingType === "SALE"
                          ? {
                              background: "oklch(0.30 0.10 242)",
                              color: "oklch(0.97 0.003 68)",
                            }
                          : {
                              background: "oklch(0.52 0.14 230)",
                              color: "oklch(0.97 0 0)",
                            }
                      }
                    >
                      {listing.listingType === "SALE" ? "Sale" : "Rent"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold whitespace-nowrap">
                  {formatPaiseCompact(listing.pricePaise)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{listing.enquiryCount}</span>
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.07em]"
                    style={{
                      background: statusInfo.bg,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-xs whitespace-nowrap">
                  {format(new Date(listing.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/properties/${listing.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon-sm" aria-label="View listing">
                        <ExternalLink size={14} />
                      </Button>
                    </Link>
                    <Link href={`/agent/listings/${listing.id}`}>
                      <Button variant="ghost" size="icon-sm" aria-label="Edit listing">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete listing"
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
