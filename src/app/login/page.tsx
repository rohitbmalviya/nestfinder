import Link from "next/link";
import { Home } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NestFinder account.",
};

interface PageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { returnUrl } = await searchParams;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.20 0.08 242) 0%, oklch(0.12 0.025 242) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
              <Home className="text-primary-foreground" size={18} />
            </div>
            <span className="font-semibold text-xl text-white">NestFinder</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-8">
          <LoginForm returnUrl={returnUrl} />

          {/* Demo credentials hint */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-0.5 mt-6">
            <p className="font-medium text-foreground">Demo credentials</p>
            <p>Buyer: priya.sharma@example.com / User@1234</p>
            <p>Agent: rahul.verma@nestfinder.dev / Agent@1234</p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
