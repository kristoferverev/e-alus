"use client";

import { Button } from "@/components/ui/button";
import { getOrCreateConversationAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type StartConversationButtonProps = {
  listingId: string;
  sellerId: string;
};

export function StartConversationButton({
  listingId,
  sellerId,
}: StartConversationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await getOrCreateConversationAction(listingId, sellerId);
      if (result.success && result.data) {
        router.push(`/chat/${result.data.id}`);
      } else {
        // Kasutame 'sonner' teeki, et kuvada viisakas teavitus
        toast.error(result.error || "Toiming ebaõnnestus.");
      }
    });
  };

  return (
    <Button onClick={handleClick} className="w-full mt-6" disabled={isPending}>
      {isPending ? "Alustan vestlust..." : "Saada sõnum"}
    </Button>
  );
}