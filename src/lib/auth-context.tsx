"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./supabase";
import { useRouter } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize session on load
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } else {
        setUser(data.session?.user || null);
      }
    };
    initSession();

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        router.refresh();
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <Context.Provider value={{ supabase, user }}>{children}</Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};