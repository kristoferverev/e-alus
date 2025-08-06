"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ListingFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    replace(pathname);
  };
  
  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange("q", term);
  }, 300);

  const hasActiveFilters = !!(searchParams.get("q") || searchParams.get("type") || searchParams.get("condition"));

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            placeholder="Otsi kuulutust pealkirja järgi..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("q")?.toString()}
            className="md:max-w-sm w-full"
          />
          <Select
            value={searchParams.get("type")?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Aluse tüüp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Kõik tüübid</SelectItem>
              <SelectItem value="EUR/EPAL">EUR/EPAL</SelectItem>
              <SelectItem value="FIN">FIN</SelectItem>
              <SelectItem value="MUU">Muu</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("condition")?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("condition", value)}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Aluse seisukord" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Kõik seisukorrad</SelectItem>
              <SelectItem value="UUS">Uus</SelectItem>
              <SelectItem value="KASUTATUD_HELE">Kasutatud (hele)</SelectItem>
              <SelectItem value="KASUTATUD_TUME">Kasutatud (tume)</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleReset} className="w-full md:w-auto">
              Tühjenda filtrid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}