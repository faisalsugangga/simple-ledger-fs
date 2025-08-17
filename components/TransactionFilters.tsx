// components/TransactionFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";

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
    (() => {
      try {
        const param = searchParams.get("accountId");
        if (param) {
          const parsed = JSON.parse(param);
          if (Array.isArray(parsed)) return parsed.map(String);
        }
        return [];
      } catch {
        return [];
      }
    })()
  );
  const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);

  useEffect(() => {
    const accountParam = searchParams.get("accountId");
    if (accountParam) {
      try {
        const parsed = JSON.parse(accountParam);
        if (Array.isArray(parsed)) setSelectedAccountIds(parsed.map(String));
        else setSelectedAccountIds([]);
      } catch {
        setSelectedAccountIds([]);
      }
    } else {
      setSelectedAccountIds([]);
    }

    const start = searchParams.get("startDate");
    setStartDate(start ? new Date(start) : undefined);

    const end = searchParams.get("endDate");
    setEndDate(end ? new Date(end) : undefined);
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
    const params = new URLSearchParams();

    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));

    if (selectedAccountIds.length > 0) {
      params.set("accountId", JSON.stringify(selectedAccountIds.map(id => Number(id))));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedAccountIds([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? startDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : <span>Tanggal Mulai</span>}
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
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? endDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : <span>Tanggal Akhir</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Multi-select akun dengan Popover */}
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
                <CommandItem key={acc.id} onSelect={() => handleAccountToggle(String(acc.id))}>
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
