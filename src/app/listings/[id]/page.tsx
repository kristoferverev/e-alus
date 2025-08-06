"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { et } from "date-fns/locale";
import { StartConversationButton } from "@/components/chat/start-conversation-button";

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listingId = params.id;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles:profiles!listings_user_id_fkey (full_name, company_name)
    `
    )
    .eq("id", listingId)
    .single();

  if (!listing) {
    return <div>Kuulutust ei leitud</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{listing.title}</CardTitle>
          <div className="text-muted-foreground">
            Lisas {listing.profiles?.company_name || listing.profiles?.full_name || "Teadmata kasutaja"},{" "}
            {format(new Date(listing.created_at), "d. MMMM yyyy", { locale: et })}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {listing.image_urls && listing.image_urls.length > 0 ? (
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={listing.image_urls[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full aspect-square flex items-center justify-center text-muted-foreground">
                  Pilt puudub
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Kirjeldus</h3>
                <p className="whitespace-pre-wrap">{listing.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Aluse tüüp</h3>
                  <p>{listing.pallet_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Seisukord</h3>
                  <p>{listing.pallet_condition}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Kogus</h3>
                  <p>{listing.quantity} tk</p>
                </div>
                <div>
                  <h3 className="font-semibold">Hind</h3>
                  <p>
                    {listing.price} €
                    {listing.price_per_piece ? '/tk' : ' (kokku)'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Asukoht</h3>
                <p>{listing.location}</p>
              </div>
              {session && (
                <StartConversationButton 
                  listingId={listingId} 
                  sellerId={listing.user_id} 
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}