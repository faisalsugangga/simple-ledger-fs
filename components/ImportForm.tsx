// components/ImportForm.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Download, UploadCloud, ShieldCheck, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipe data untuk baris Excel dan data yang akan diimpor
type ExcelRow = {
  Tanggal?: string | number | Date;
  Deskripsi?: string;
  'Akun Debit'?: string;
  'Akun Kredit'?: string;
  Jumlah?: number;
};

type TransactionToImport = {
    transaction_date: string;
    description: string;
    entries: { account_name: string; type: 'debit' | 'credit'; amount: number }[];
};

// Tipe untuk hasil dari RPC
type RpcResult = {
  status: 'success' | 'error';
  row_number: number;
  message: string;
};

export function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<TransactionToImport[]>([]);
  const supabase = createClient();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setValidationErrors([]);
      setPreviewData([]);
    }
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Tanggal: "2025-08-17",
        Deskripsi: "Pembelian ATK dari Toko ABC",
        "Akun Debit": "Beban ATK",
        "Akun Kredit": "Kas Tunai",
        Jumlah: 500000,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
    XLSX.writeFile(workbook, "template-import-transaksi.xlsx");
  };

  const handleValidate = () => {
    if (!file) {
      toast.error("Silakan pilih file untuk divalidasi.");
      return;
    }
    setIsLoading(true);
    setValidationErrors([]);
    setPreviewData([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        const errors: string[] = [];
        const validData: TransactionToImport[] = [];

        if (json.length === 0) {
          errors.push("File Excel tidak boleh kosong.");
        }

        json.forEach((row, index) => {
          const rowNum = index + 2; // Nomor baris di Excel (termasuk header)
          const { Tanggal, Deskripsi, 'Akun Debit': AkunDebit, 'Akun Kredit': AkunKredit, Jumlah } = row;
          
          let rowHasError = false;
          if (!Tanggal) {
            errors.push(`Baris ${rowNum}: Kolom 'Tanggal' tidak boleh kosong.`);
            rowHasError = true;
          }
          if (!Deskripsi) {
            errors.push(`Baris ${rowNum}: Kolom 'Deskripsi' tidak boleh kosong.`);
            rowHasError = true;
          }
          if (!AkunDebit) {
            errors.push(`Baris ${rowNum}: Kolom 'Akun Debit' tidak boleh kosong.`);
            rowHasError = true;
          }
          if (!AkunKredit) {
            errors.push(`Baris ${rowNum}: Kolom 'Akun Kredit' tidak boleh kosong.`);
            rowHasError = true;
          }
          if (Jumlah === undefined || Jumlah === null) {
            errors.push(`Baris ${rowNum}: Kolom 'Jumlah' tidak boleh kosong.`);
            rowHasError = true;
          }
          if (typeof Jumlah !== 'number' || Jumlah <= 0) {
            errors.push(`Baris ${rowNum}: Kolom 'Jumlah' harus angka positif.`);
            rowHasError = true;
          }
          
          if (!rowHasError) {
            validData.push({
              transaction_date: new Date(Tanggal as Date).toISOString().split('T')[0],
              description: Deskripsi as string,
              entries: [
                { account_name: AkunDebit as string, type: 'debit', amount: Jumlah as number },
                { account_name: AkunKredit as string, type: 'credit', amount: Jumlah as number }
              ]
            });
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
          toast.error("Ditemukan beberapa error pada file Anda.");
        } else {
          setPreviewData(validData);
          toast.success("Validasi berhasil! Silakan periksa data di bawah sebelum mengimpor.");
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
        toast.error(`Gagal memproses file: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) {
      toast.error("Tidak ada data valid untuk diimpor.");
      return;
    }
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase.rpc('import_transactions_from_json', {
        transactions_json: previewData,
        creator_id: user?.id,
        creator_email: user?.email
      });

      if (error) throw error;
      
      const rpcResults = result as RpcResult[];
      let successCount = 0;
      let errorCount = 0;
      rpcResults.forEach((res: RpcResult) => {
        if (res.status === 'success') {
          successCount++;
        } else {
          errorCount++;
          toast.error(`Baris ${res.row_number}: ${res.message}`);
        }
      });


      if (successCount > 0) {
        toast.success(`${successCount} transaksi berhasil diimpor!`);
      }
      if (errorCount === 0 && successCount > 0) {
        setTimeout(() => window.location.href = "/", 1000);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
      toast.error(`Terjadi kesalahan saat impor: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <div>
        <h3 className="font-semibold mb-2">1. Unduh Template</h3>
        <p className="text-sm text-muted-foreground mb-4">Gunakan template ini untuk memastikan format data Anda benar.</p>
        <Button variant="secondary" onClick={handleDownloadTemplate}><Download className="mr-2 h-4 w-4" />Unduh Template</Button>
      </div>

      {/* Step 2: Upload & Validate */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2">2. Unggah dan Validasi File</h3>
        <div className="flex items-center gap-4">
          <Input id="excel-file" type="file" onChange={handleFileChange} accept=".xlsx, .csv" className="max-w-sm"/>
          <Button onClick={handleValidate} disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Validasi Data
          </Button>
        </div>
      </div>

      {/* Validation Results */}
      {validationErrors.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-red-600 dark:text-red-500 flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Hasil Validasi (Ditemukan Error)</h3>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md max-h-60 overflow-y-auto">
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-800 dark:text-red-300">
              {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Preview & Submit */}
      {previewData.length > 0 && (
         <div className="border-t pt-6">
          <h3 className="font-semibold text-green-600 dark:text-green-500 flex items-center"><ShieldCheck className="mr-2 h-5 w-5" />Pratinjau Data (Valid)</h3>
          <div className="mt-4 border rounded-md max-h-60 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Akun Debit</TableHead>
                  <TableHead>Akun Kredit</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((tx, i) => (
                  <TableRow key={i}>
                    <TableCell>{tx.transaction_date}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.entries.find(e => e.type === 'debit')?.account_name}</TableCell>
                    <TableCell>{tx.entries.find(e => e.type === 'credit')?.account_name}</TableCell>
                    <TableCell className="text-right">{tx.entries[0].amount.toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading} className="mt-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Konfirmasi & Mulai Import
          </Button>
        </div>
      )}
    </div>
  );
}