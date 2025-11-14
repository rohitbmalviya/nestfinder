export const dynamic = "force-dynamic";

import { getAgentStats, getEnquiriesSeries, getMyEnquiries } from "@/lib/actions/agent";
import { Building2, MessageSquare, Bell, TrendingUp } from "lucide-react";
import { EnquiriesChart } from "@/components/agent/enquiries-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Dashboard",
  description: "Your NestFinder agent dashboard.",
};

function enquiryStatusStyle(status: string) {
  if (status === "NEW") {
    return { bg: "oklch(0.30 0.10 242)", color: "oklch(0.97 0.003 68)", label: "New" };
  }
  if (status === "CONTACTED") {
    return { bg: "oklch(0.72 0.14 68)", color: "oklch(0.12 0.04 68)", label: "Contacted" };
  }
  return { bg: "oklch(0.48 0.02 242)", color: "oklch(0.90 0.008 68)", label: "Closed" };
}

export default async function AgentDashboardPage() {
  const [stats, series, enquiries] = await Promise.all([
    getAgentStats(),
    getEnquiriesSeries(),
    getMyEnquiries(),
  ]);

  const recentEnquiries = enquiries.slice(0, 6);

  const KPI_CARDS = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      sub: `${stats.totalListings} total`,
      icon: Building2,
    },
    {
      label: "Total Enquiries",
      value: stats.totalEnquiries,
      sub: "All time",
      icon: MessageSquare,
    },
    {
      label: "New Enquiries",
      value: stats.newEnquiries,
      sub: "Unread",
      icon: Bell,
    },
    {
      label: "Active Rate",
      value: stats.totalListings > 0
        ? `${Math.round((stats.activeListings / stats.totalListings) * 100)}%`
        : "—",
      sub: "Active / total",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your listings and enquiries
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.08em] mb-1">
                  {label}
                </p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{ background: "oklch(0.94 0.04 68)" }}
              >
                <Icon
                  size={20}
                  style={{ color: "oklch(0.30 0.10 242)" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Enquiries — Last 30 Days
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily enquiry volume
            </p>
          </div>
        </div>
        <EnquiriesChart data={series} />
      </div>

      {/* Recent enquiries */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Recent Enquiries
          </h2>
          <Link href="/agent/enquiries">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No enquiries yet. Share your listings to start receiving enquiries.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEnquiries.map((enq) => {
                const statusInfo = enquiryStatusStyle(enq.status);
                return (
                  <TableRow key={enq.id}>
                    <TableCell className="max-w-36 truncate font-medium">
                      {enq.propertyTitle}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {enq.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-48 truncate text-muted-foreground">
                      {enq.message}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                      {format(new Date(enq.createdAt), "dd MMM")}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.07em]"
                        style={{
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href="/agent/enquiries">
                        <Button variant="outline" size="xs">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
