"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createEnquiry } from "@/lib/actions/enquiries";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

interface EnquiryFormProps {
  propertyId: string;
  user: { name: string; email: string } | null;
}

export function EnquiryForm({ propertyId, user }: EnquiryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      message: "Hi, I'm interested in this property. Please contact me with more details.",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await createEnquiry({ propertyId, ...data });
      if (result.success) {
        toast.success(
          "Enquiry sent — the agent will contact you shortly."
        );
        reset({
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: "",
          message: "",
        });
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Send Enquiry
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div>
          <Label htmlFor="enq-name" className="text-xs text-muted-foreground mb-1 block">
            Your Name
          </Label>
          <Input
            id="enq-name"
            type="text"
            autoComplete="name"
            aria-describedby={errors.name ? "enq-name-error" : undefined}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p id="enq-name-error" className="text-xs text-destructive mt-1" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="enq-email" className="text-xs text-muted-foreground mb-1 block">
            Email Address
          </Label>
          <Input
            id="enq-email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? "enq-email-error" : undefined}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p id="enq-email-error" className="text-xs text-destructive mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="enq-phone" className="text-xs text-muted-foreground mb-1 block">
            Phone Number
          </Label>
          <Input
            id="enq-phone"
            type="tel"
            autoComplete="tel"
            aria-describedby={errors.phone ? "enq-phone-error" : undefined}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p id="enq-phone-error" className="text-xs text-destructive mt-1" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="enq-message" className="text-xs text-muted-foreground mb-1 block">
            Message
          </Label>
          <Textarea
            id="enq-message"
            rows={4}
            aria-describedby={errors.message ? "enq-message-error" : undefined}
            aria-invalid={!!errors.message}
            {...register("message")}
          />
          {errors.message && (
            <p id="enq-message-error" className="text-xs text-destructive mt-1" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 gap-2" disabled={isSubmitting}>
          <Send size={15} />
          {isSubmitting ? "Sending..." : "Send Enquiry"}
        </Button>
      </form>
    </div>
  );
}
