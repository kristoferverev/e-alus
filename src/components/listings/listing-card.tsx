"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { Database } from "@/lib/database.types";

type ListingWithProfile = Database["public"]["Tables"]["listings"]["Row"] & {
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "company_name"> | null;
};

type ListingCardProps = {
  listing: ListingWithProfile;
};

export function ListingCard({ listing }: ListingCardProps) {
  const sellerName =
    listing.profiles?.company_name || listing.profiles?.full_name || "N/A";

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:border-primary group-hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-secondary mb-4">
            {/* TODO: Replace with Next/Image when images are implemented */}
            <div className="h-full w-full bg-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <p className="text-muted-foreground text-sm">Pilt puudub</p>
            </div>
          </div>
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <CardDescription className="text-xs">Müüja: {sellerName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pt-0 pb-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">kogus</p>
              <p className="font-semibold">{listing.quantity} tk</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground text-right">hind/tk</p>
              <p className="text-2xl font-bold text-right">{listing.price} €</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <Badge variant="secondary">{listing.pallet_type}</Badge>
          <Badge variant="outline">{listing.pallet_condition}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}