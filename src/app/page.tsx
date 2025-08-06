"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listings/listing-card";
import { Database } from "@/lib/database.types";
import { ListingFilters } from "@/components/listings/listing-filters";
import { useSearch } from "./SearchProvider";
import { createBrowserClient } from "@supabase/ssr";

// Simplified type for listings
type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles: {
    full_name: string | null;
    company_name: string | null;
  } | null;
};

// Define enum types
type PalletType = Database['public']['Enums']['pallet_type'];
type PalletCondition = Database['public']['Enums']['pallet_condition'];

export default function Home() {
  const { query, type, condition } = useSearch();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      let queryBuilder = supabase
        .from("listings")
        .select(`
          *,
          profiles (
            full_name,
            company_name
          )
        `);
      
      if (query) {
        queryBuilder = queryBuilder.textSearch("title", query, {
          type: "websearch",
          config: "estonian",
        });
      }

      // Apply type filter only if valid and not "all"
      if (type && type !== "all") {
        queryBuilder = queryBuilder.eq("pallet_type", type as PalletType);
      }

      // Apply condition filter only if valid and not "all"
      if (condition && condition !== "all") {
        queryBuilder = queryBuilder.eq("pallet_condition", condition as PalletCondition);
      }

      const { data, error } = await queryBuilder.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching listings:", error);
      } else {
        setListings(data || []);
      }
      setLoading(false);
    };

    fetchListings();
  }, [query, type, condition, supabase]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Turuplats</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Sirvi, otsi ja filtreeri Eesti parimaid euroaluste pakkumisi.
        </p>
      </div>

      <ListingFilters />

      {loading ? (
        <div className="text-center py-16">
          <p>Laen kuulutusi...</p>
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground mb-4"
          >
            <path d="m21.73 18.27-1.42 1.42a9 9 0 1 1-1.41-1.41l1.41-1.42a9 9 0 1 1 1.42 1.42z"></path>
            <path d="M22 2 2 22"></path>
          </svg>
          <h2 className="text-xl font-semibold">Vasteid ei leitud</h2>
          <p className="text-muted-foreground mt-2">
            Proovi oma otsingut muuta või eemalda mõni filter.
          </p>
        </div>
      )}
    </div>
  );
}
