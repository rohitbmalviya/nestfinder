import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
              <Home className="text-primary-foreground" size={14} />
            </div>
            <span className="font-semibold tracking-tight">NestFinder</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/properties?listingType=SALE"
              className="hover:text-foreground transition-colors"
            >
              Buy
            </Link>
            <Link
              href="/properties?listingType=RENT"
              className="hover:text-foreground transition-colors"
            >
              Rent
            </Link>
            <Link
              href="/register?role=AGENT"
              className="hover:text-foreground transition-colors"
            >
              List Property
            </Link>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NestFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
