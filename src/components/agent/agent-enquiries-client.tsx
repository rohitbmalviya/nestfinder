"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEnquiryStatus } from "@/lib/actions/agent";
import type { AgentEnquiry } from "@/lib/actions/agent";

function statusStyle(status: string) {
  if (status === "NEW") {
    return { bg: "oklch(0.30 0.10 242)", color: "oklch(0.97 0.003 68)", label: "New" };
  }
  if (status === "CONTACTED") {
    return { bg: "oklch(0.72 0.14 68)", color: "oklch(0.12 0.04 68)", label: "Contacted" };
  }
  return { bg: "oklch(0.48 0.02 242)", color: "oklch(0.90 0.008 68)", label: "Closed" };
}

interface AgentEnquiriesClientProps {
  enquiries: AgentEnquiry[];
}

export function AgentEnquiriesClient({ enquiries }: AgentEnquiriesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(enquiries.map((e) => [e.id, e.status]))
  );

  function handleStatusChange(enquiryId: string, newStatus: string) {
    if (!newStatus) return;
    setStatuses((prev) => ({ ...prev, [enquiryId]: newStatus }));
    startTransition(async () => {
      try {
        const result = await updateEnquiryStatus(enquiryId, newStatus);
        if (result.success) {
          toast.success("Status updated");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to update status");
          // Revert optimistic update
          setStatuses((prev) => ({
            ...prev,
            [enquiryId]: enquiries.find((e) => e.id === enquiryId)?.status ?? prev[enquiryId],
          }));
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  const tabs = [
    { value: "ALL", label: "All", filter: () => true },
    { value: "NEW", label: "New", filter: (e: AgentEnquiry) => e.status === "NEW" },
    { value: "CONTACTED", label: "Contacted", filter: (e: AgentEnquiry) => e.status === "CONTACTED" },
    { value: "CLOSED", label: "Closed", filter: (e: AgentEnquiry) => e.status === "CLOSED" },
  ];

  function EnquiriesTable({ data }: { data: AgentEnquiry[] }) {
    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No enquiries in this category.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Enquirer</TableHead>
              <TableHead className="hidden sm:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Message</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((enq) => {
              const currentStatus = statuses[enq.id] ?? enq.status;
              const statusInfo = statusStyle(currentStatus);
              return (
                <TableRow key={enq.id}>
                  <TableCell className="max-w-40">
                    <div className="font-medium truncate text-sm">
                      {enq.propertyTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{enq.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-xs text-muted-foreground">{enq.email}</div>
                    <div className="text-xs text-muted-foreground">{enq.phone}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-52">
                    <p className="text-xs text-muted-foreground truncate">
                      {enq.message}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(enq.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.07em] shrink-0"
                        style={{
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                      <Select
                        value={currentStatus}
                        onValueChange={(v) => {
                          if (v) handleStatusChange(enq.id, v);
                        }}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-28 text-xs"
                          aria-label={`Update status for enquiry from ${enq.name}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="CONTACTED">Contacted</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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

  return (
    <Tabs defaultValue="ALL">
      <TabsList className="mb-6">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.value !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-60">
                ({enquiries.filter(tab.filter).length})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <EnquiriesTable data={enquiries.filter(tab.filter)} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
