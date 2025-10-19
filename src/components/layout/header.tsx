import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Heart,
  LogOut,
  LayoutDashboard,
  Building2,
} from "lucide-react";

export async function Header() {
  const user = await getCurrentUser();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Home className="text-primary-foreground" size={16} />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              NestFinder
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/properties?listingType=SALE">
              <Button variant="ghost" size="sm">
                Buy
              </Button>
            </Link>
            <Link href="/properties?listingType=RENT">
              <Button variant="ghost" size="sm">
                Rent
              </Button>
            </Link>
            {user?.role === "AGENT" && (
              <Link href="/agent/listings/new">
                <Button variant="ghost" size="sm">
                  List Property
                </Button>
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/favorites" aria-label="My saved properties">
                  <Button variant="ghost" size="icon">
                    <Heart size={18} />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground max-w-32 truncate">
                      {user.name}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        {user.email}
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    {user.role === "AGENT" ? (
                      <DropdownMenuItem>
                        <Link
                          href="/agent"
                          className="flex items-center gap-2 w-full"
                        >
                          <LayoutDashboard size={14} />
                          Agent Dashboard
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 w-full"
                        >
                          <Heart size={14} />
                          Saved Properties
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <form action={logoutAction} className="w-full">
                        <button
                          type="submit"
                          className="flex items-center gap-2 w-full text-left text-destructive"
                        >
                          <LogOut size={14} />
                          Log out
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1">
            {user && (
              <Link href="/favorites">
                <Button variant="ghost" size="icon">
                  <Heart size={18} />
                </Button>
              </Link>
            )}
            {!user && (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
            {user?.role === "AGENT" && (
              <Link href="/agent">
                <Button variant="ghost" size="icon">
                  <Building2 size={18} />
                </Button>
              </Link>
            )}
            {user && (
              <form action={logoutAction}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut size={18} />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
