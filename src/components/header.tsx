import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

export async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link
          href="/"
          className="mr-6 flex items-center space-x-2 text-xl font-bold tracking-tight"
        >
          E-alus
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            {session ? (
              <>
                <Button asChild>
                  <Link href="/listings/new">Lisa kuulutus</Link>
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
                    {session.user.email?.[0].toUpperCase()}
                  </div>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth">Logi sisse</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}