// components/Pagination.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  perPage: number;
  perPageOptions: number[];
}

export function Pagination({ totalPages, currentPage, perPage, perPageOptions }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageURL = (page: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = Number(value);
    const params = new URLSearchParams(searchParams);
    params.set("perPage", newPerPage.toString());
    params.set("page", "1"); // Kembali ke halaman 1 saat perPage berubah
    router.push(`${pathname}?${params.toString()}`);
  };

  const prevPageUrl = createPageURL(currentPage - 1);
  const nextPageUrl = createPageURL(currentPage + 1);
  
  // Memastikan currentPage tidak melebihi totalPages untuk menghindari bug
  const validCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const displayCurrentPage = validCurrentPage < 1 ? 1 : validCurrentPage;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Tampilkan
        </span>
        <Select value={String(perPage)} onValueChange={handlePerPageChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          per halaman
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Halaman {displayCurrentPage} dari {totalPages}
        </span>
        <div className="space-x-2">
          {currentPage <= 1 ? (
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild variant="outline" size="icon">
              <Link href={prevPageUrl}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {currentPage >= totalPages ? (
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild variant="outline" size="icon">
              <Link href={nextPageUrl}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}