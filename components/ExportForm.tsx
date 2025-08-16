// components/ExportForm.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, Download, CalendarIcon } from "lucide-react";
import { getTransactionsForExport } from "@/app/actions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ExportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
      const end = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

      const result = await getTransactionsForExport(start, end);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Gagal mengambil data untuk ekspor.");
      }
      
      if (result.data.length === 0) {
        toast.info("Tidak ada data transaksi pada rentang tanggal yang dipilih.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(result.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
      XLSX.writeFile(workbook, `export-transaksi-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success("Data berhasil diekspor!");

    } catch (error: any) {
      toast.error(`Gagal mengekspor data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div>
            <h3 className="font-semibold mb-2">Pilih Rentang Tanggal (Opsional)</h3>
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
             <p className="text-xs text-muted-foreground mt-2">Jika tanggal tidak dipilih, semua transaksi akan diekspor.</p>
        </div>
        <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Download className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Mengekspor..." : "Export ke Excel"}
        </Button>
    </div>
  );
}
