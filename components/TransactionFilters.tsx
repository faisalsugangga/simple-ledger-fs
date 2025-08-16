// components/TransactionFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

type Account = { id: number; name: string };

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
  );
  
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    searchParams.get("accountId")?.split(',') || []
  );
  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);

  // Perbaikan: Tambahkan useEffect untuk menyinkronkan state dengan URL
  useEffect(() => {
    const accountIdsFromUrl = searchParams.get("accountId")?.split(',') || [];
    setSelectedAccountIds(accountIdsFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase.from("accounts").select("id, name").order("name");
      if (data) setAccounts(data);
    };
    fetchAccounts();
  }, [supabase]);

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
    else params.delete("startDate");

    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
    else params.delete("endDate");
    
    // Perubahan: Menyimpan array ID akun sebagai string terpisah koma
    if (selectedAccountIds.length > 0) params.set("accountId", selectedAccountIds.join(','));
    else params.delete("accountId");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Tanggal Mulai</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
          </PopoverContent>
        </Popover>
        <span className="text-muted-foreground">-</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Tanggal Akhir</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Perubahan: Menggunakan Popover untuk multi-select akun */}
      <Popover open={isAccountPopoverOpen} onOpenChange={setIsAccountPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isAccountPopoverOpen}
            className="w-[280px] justify-between"
          >
            {selectedAccountIds.length > 0
              ? `${selectedAccountIds.length} akun terpilih`
              : "Filter berdasarkan Akun..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Cari akun..." />
            <CommandEmpty>Tidak ada akun ditemukan.</CommandEmpty>
            <CommandGroup>
              {accounts.map(acc => (
                <CommandItem
                  key={acc.id}
                  onSelect={() => handleAccountToggle(String(acc.id))}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedAccountIds.includes(String(acc.id))}
                      onCheckedChange={() => handleAccountToggle(String(acc.id))}
                    />
                    <span>{acc.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Button onClick={handleFilter}>Terapkan Filter</Button>
      <Button variant="ghost" onClick={clearFilters}>Bersihkan</Button>
    </div>
  );
}