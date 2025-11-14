import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { AgentSidebarNav } from "@/components/agent/agent-sidebar-nav";
import {
  Home,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "AGENT") {
    redirect("/login");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col border-r"
        style={{
          background: "var(--sidebar)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--sidebar-primary)" }}
            >
              <Home
                size={15}
                style={{ color: "var(--sidebar-primary-foreground)" }}
              />
            </div>
            <span className="font-semibold text-sm">NestFinder</span>
          </Link>
          <p
            className="text-[10px] mt-0.5 ml-10 opacity-50"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            Agent Portal
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <AgentSidebarNav />
        </nav>

        {/* Bottom actions */}
        <div
          className="px-3 py-4 border-t space-y-1"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            <ArrowLeft size={15} />
            Back to Site
          </Link>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 px-3"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              <LogOut size={15} />
              Log out
            </Button>
          </form>
        </div>

        {/* Agent info */}
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: "oklch(0.22 0.06 242)",
                  color: "var(--sidebar-primary)",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "var(--sidebar-foreground)" }}
              >
                {user.name}
              </p>
              {user.agencyName && (
                <p
                  className="text-[10px] truncate opacity-60"
                  style={{ color: "var(--sidebar-foreground)" }}
                >
                  {user.agencyName}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto bg-background">
        {children}
      </div>
    </div>
  );
}
