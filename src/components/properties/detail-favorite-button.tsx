"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/favorites";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailFavoriteButtonProps {
  propertyId: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function DetailFavoriteButton({
  propertyId,
  isFavorited: initialFavorited,
  isLoggedIn,
  fullWidth = false,
  className,
}: DetailFavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login?returnUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleFavorite(propertyId);
        if (result.success) {
          setFavorited(result.data.favorited);
          toast.success(
            result.data.favorited
              ? "Added to favourites"
              : "Removed from favourites"
          );
        } else {
          toast.error(result.error ?? "Something went wrong");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "UNAUTHENTICATED") {
          router.push("/login");
        } else {
          toast.error("Something went wrong");
        }
      }
    });
  }

  return (
    <Button
      variant={favorited ? "secondary" : "outline"}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "h-11 gap-2 border-primary text-primary",
        favorited && "border-0",
        fullWidth && "w-full",
        className
      )}
      aria-pressed={favorited}
    >
      <Heart
        size={16}
        className={
          favorited
            ? "fill-[oklch(0.60_0.18_15)] stroke-[oklch(0.60_0.18_15)]"
            : ""
        }
      />
      {favorited ? "Saved to Favourites" : "Save to Favourites"}
    </Button>
  );
}
