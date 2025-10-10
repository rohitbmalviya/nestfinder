"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/auth-actions";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  returnUrl?: string;
}

export function LoginForm({ returnUrl }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await loginAction(data);
      if (result.success) {
        toast.success("Welcome back!");
        if (returnUrl) {
          router.push(returnUrl);
        } else if (result.data.role === "AGENT") {
          router.push("/agent");
        } else {
          router.push("/properties");
        }
      } else {
        toast.error(result.error ?? "Invalid credentials");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="login-email" className="text-sm font-medium mb-1.5 block">
          Email address
        </Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? "login-email-error" : undefined}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p id="login-email-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="login-password" className="text-sm font-medium mb-1.5 block">
          Password
        </Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-describedby={errors.password ? "login-password-error" : undefined}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p id="login-password-error" className="text-xs text-destructive mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full h-11 mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
