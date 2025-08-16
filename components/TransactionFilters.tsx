// components/TransactionFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

type Account = { id: number; name: string };

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
  );
  const [accountId, setAccountId] = useState(searchParams.get("accountId") || "");

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase.from("accounts").select("id, name").order("name");
      if (data) setAccounts(data);
    };
    fetchAccounts();
  }, [supabase]);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
    else params.delete("startDate");

    if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
    else params.delete("endDate");
    
    if (accountId) params.set("accountId", accountId);
    else params.delete("accountId");

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setAccountId("");
    router.push("/");
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

      <Select value={accountId} onValueChange={setAccountId}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Filter berdasarkan Akun..." />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={String(acc.id)}>
              {acc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button onClick={handleFilter}>Terapkan Filter</Button>
      <Button variant="ghost" onClick={clearFilters}>Bersihkan</Button>
    </div>
  );
}