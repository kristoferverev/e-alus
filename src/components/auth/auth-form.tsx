"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, User } from "lucide-react";

// Valideerimisskeem Zod teegiga
const formSchema = z.object({
  email: z.string().email({ message: "Palun sisesta korrektne e-posti aadress." }),
  password: z.string().min(6, { message: "Parool peab olema vähemalt 6 tähemärki pikk." }),
  full_name: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  });

  // Sisselogimise/Registreerimise käsitleja
  const handleSubmit = async (values: FormData, action: "sign-in" | "sign-up") => {
    setLoading(true);
    setError(null);

    if (action === "sign-up") {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
          },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        // Registreerimine õnnestus, nüüd peab kasutaja e-posti kinnitama
        alert("Registreerimine õnnestus! Palun kinnita oma e-post.");
      }
    }

    if (action === "sign-in") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        setError(error.message);
      } else if (data.session) {
        router.refresh(); // Refresh to update session state
        router.push("/"); // Redirect to homepage after successful login
      } else {
        setError("Sisselogimine ebaõnnestus. Palun proovi uuesti.");
      }
    }
    setLoading(false);
  };

  // Sotsiaalmeediaga sisselogimine
  const handleOAuthSignIn = async (provider: "google" | "azure") => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
  };

  return (
    <Tabs defaultValue="sign-in" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sign-in">Logi sisse</TabsTrigger>
        <TabsTrigger value="sign-up">Registreeru</TabsTrigger>
      </TabsList>
      
      {/* Sisselogimise vaade */}
      <TabsContent value="sign-in" className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => handleSubmit(values, "sign-in"))} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input placeholder="sinu.email@ettevote.ee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parool</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Laen..." : "Logi sisse"}
            </Button>
          </form>
        </Form>
      </TabsContent>

      {/* Registreerimise vaade */}
      <TabsContent value="sign-up" className="pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => handleSubmit(values, "sign-up"))} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Täisnimi</FormLabel>
                  <FormControl>
                    <Input placeholder="Mari Maasikas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input placeholder="sinu.email@ettevote.ee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parool</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
             {loading ? "Laen..." : "Registreeru"}
            </Button>
          </form>
        </Form>
      </TabsContent>

      {/* Veateated ja sotsiaalmeedia nupud */}
      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Või jätka
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => handleOAuthSignIn("google")} disabled={loading}>
          <Globe className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" onClick={() => handleOAuthSignIn("azure")} disabled={loading}>
          <User className="mr-2 h-4 w-4" />
          Microsoft
        </Button>
      </div>
    </Tabs>
  );
}