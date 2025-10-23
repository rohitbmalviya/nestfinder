"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildUrl(
  searchParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/properties?${params.toString()}`;
}

export function PropertiesPagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5"
    >
      <Link
        href={buildUrl(searchParams, currentPage - 1)}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
      >
        <Button variant="outline" size="icon-sm" aria-label="Previous page">
          <ChevronLeft size={14} />
        </Button>
      </Link>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 text-muted-foreground text-sm"
          >
            …
          </span>
        ) : (
          <Link key={p} href={buildUrl(searchParams, p as number)}>
            <Button
              variant={p === currentPage ? "default" : "outline"}
              size="icon-sm"
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Button>
          </Link>
        )
      )}

      <Link
        href={buildUrl(searchParams, currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
        className={
          currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
        }
      >
        <Button variant="outline" size="icon-sm" aria-label="Next page">
          <ChevronRight size={14} />
        </Button>
      </Link>
    </nav>
  );
}
