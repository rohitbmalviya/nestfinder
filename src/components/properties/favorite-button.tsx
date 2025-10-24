"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/favorites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export function FavoriteButton({
  propertyId,
  isFavorited: initialFavorited,
  isLoggedIn,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

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
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
      className={cn(
        "flex items-center justify-center w-11 h-11 rounded-full transition-all disabled:opacity-50",
        "drop-shadow-sm hover:scale-110 active:scale-95",
        className
      )}
    >
      <Heart
        size={20}
        className={
          favorited
            ? "fill-[oklch(0.60_0.18_15)] stroke-[oklch(0.60_0.18_15)]"
            : "fill-transparent stroke-white drop-shadow"
        }
      />
    </button>
  );
}
