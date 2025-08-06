import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/listing-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewListingPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Lisa uus kuulutus</CardTitle>
          <CardDescription>
            Täida allolevad väljad, et lisada oma euroalused müüki.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm />
        </CardContent>
      </Card>
    </div>
  );
}