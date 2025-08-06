"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createListingAction } from "@/app/actions";
import { Separator } from "@/components/ui/separator";

// Kliendipoolne valideerimine ajutiselt maas tüübiprobleemide tõttu.
// Serveripoolne valideerimine on endiselt aktiivne failis actions.ts.

type ListingFormData = {
  title: string;
  description: string;
  pallet_type: "EUR/EPAL" | "FIN" | "MUU";
  pallet_condition: "UUS" | "KASUTATUD_HELE" | "KASUTATUD_TUME";
  quantity: number;
  price: number;
  location: string;
};

export function ListingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

 const form = useForm<ListingFormData>({
    defaultValues: {
      title: "",
      description: "",
      pallet_type: "EUR/EPAL",
      pallet_condition: "KASUTATUD_HELE",
      quantity: 10,
      price: 8.5,
      location: "",
    },
  });

  function onSubmit(values: ListingFormData) {
    setError(null);
    startTransition(async () => {
      const result = await createListingAction(values);

      if (result.success && result.data) {
        router.push(`/listings/${result.data.id}`);
      } else {
        setError(result.error || "Kuulutuse loomisel tekkis tundmatu viga.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kuulutuse pealkiri</FormLabel>
                <FormControl>
                  <Input placeholder="Nt: 50tk EUR/EPAL heledaid aluseid" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kirjeldus</FormLabel>
                <FormControl>
                  <Textarea placeholder="Lisa täpsem kirjeldus aluste seisukorra, kvaliteedi ja muu olulise kohta..." {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />

        {/* Section 2: Pallet Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Aluse andmed</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pallet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tüüp</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vali aluse tüüp" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EUR/EPAL">EUR/EPAL</SelectItem>
                      <SelectItem value="FIN">FIN</SelectItem>
                      <SelectItem value="MUU">Muu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pallet_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seisukord</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vali aluse seisukord" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UUS">Uus</SelectItem>
                      <SelectItem value="KASUTATUD_HELE">Kasutatud (hele)</SelectItem>
                      <SelectItem value="KASUTATUD_TUME">Kasutatud (tume)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kogus (tk)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hind (€ / tk)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="9.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />
        
        {/* Section 3: Location */}
        <div className="space-y-4">
           <h3 className="text-lg font-medium">Asukoht</h3>
           <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linnaosa, linn või maakond</FormLabel>
                  <FormControl>
                    <Input placeholder="Nt: Tallinn, Harjumaa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {error && <p className="text-destructive text-sm font-medium">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Salvestan..." : "Lisa kuulutus"}
        </Button>
      </form>
    </Form>
  );
}