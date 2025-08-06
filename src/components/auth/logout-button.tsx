"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Värskendab lehte, et server saaks uue (tühja) sessiooni kätte
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logi välja
    </Button>
  );
}