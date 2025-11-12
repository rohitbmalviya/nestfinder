"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/agent",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/agent/listings",
    label: "My Listings",
    icon: Building2,
    exact: false,
  },
  {
    href: "/agent/enquiries",
    label: "Enquiries",
    icon: MessageSquare,
    exact: false,
  },
];

export function AgentSidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5" role="list">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
              )}
              style={
                isActive
                  ? {
                      background: "var(--sidebar-accent)",
                      color: "var(--sidebar-primary)",
                      fontWeight: 600,
                    }
                  : {
                      color: "oklch(0.90 0.008 68 / 70%)",
                    }
              }
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
