"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/auth-actions";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  agencyName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  defaultRole: "USER" | "AGENT";
}

export function RegisterForm({ defaultRole }: RegisterFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "AGENT">(defaultRole);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await registerAction({
        ...data,
        role,
        agencyName: role === "AGENT" ? data.agencyName : undefined,
      });
      if (result.success) {
        toast.success("Account created successfully!");
        if (result.data.role === "AGENT") {
          router.push("/agent");
        } else {
          router.push("/properties");
        }
      } else {
        if (result.fieldErrors) {
          for (const msg of Object.values(result.fieldErrors).flat()) {
            toast.error(msg);
          }
        } else {
          toast.error(result.error ?? "Failed to create account");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Role toggle */}
      <div>
        <p className="text-sm font-medium mb-2">I am a…</p>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setRole("USER")}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={
              role === "USER"
                ? {
                    background: "oklch(0.30 0.10 242)",
                    color: "oklch(0.97 0.003 68)",
                  }
                : { background: "transparent", color: "var(--foreground)" }
            }
          >
            Buyer / Renter
          </button>
          <button
            type="button"
            onClick={() => setRole("AGENT")}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={
              role === "AGENT"
                ? {
                    background: "oklch(0.30 0.10 242)",
                    color: "oklch(0.97 0.003 68)",
                  }
                : { background: "transparent", color: "var(--foreground)" }
            }
          >
            Property Agent
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="reg-name" className="text-sm font-medium mb-1.5 block">
          Full Name
        </Label>
        <Input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder="Raj Sharma"
          aria-describedby={errors.name ? "reg-name-error" : undefined}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p id="reg-name-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="reg-email" className="text-sm font-medium mb-1.5 block">
          Email Address
        </Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p id="reg-email-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="reg-password" className="text-sm font-medium mb-1.5 block">
          Password
        </Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          aria-describedby={errors.password ? "reg-password-error" : undefined}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p id="reg-password-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="reg-phone" className="text-sm font-medium mb-1.5 block">
          Phone Number{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          {...register("phone")}
        />
      </div>

      {role === "AGENT" && (
        <div>
          <Label htmlFor="reg-agency" className="text-sm font-medium mb-1.5 block">
            Agency Name{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="reg-agency"
            type="text"
            placeholder="Mumbai Realty Group"
            {...register("agencyName")}
          />
        </div>
      )}

      <Button type="submit" className="w-full h-11 mt-2" disabled={isSubmitting}>
        {isSubmitting
          ? "Creating account…"
          : role === "AGENT"
          ? "Create Agent Account"
          : "Create Account"}
      </Button>
    </form>
  );
}
