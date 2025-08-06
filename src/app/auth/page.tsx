import { AuthForm } from "@/components/auth/auth-form";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthWrapper
      title="Tere tulemast tagasi!"
      description="Logi sisse või registreeru, et jätkata."
    >
      <AuthForm />
    </AuthWrapper>
  );
}