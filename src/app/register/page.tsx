import Link from "next/link";
import { Home } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your NestFinder account to browse, save, and enquire about properties.",
};

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { role } = await searchParams;
  const defaultRole = role === "AGENT" ? "AGENT" : "USER";

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
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-white/60 text-sm mt-1">
            Join thousands of buyers, renters, and agents
          </p>
        </div>

        <div className="rounded-xl bg-card border border-border p-8">
          <RegisterForm defaultRole={defaultRole} />

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
