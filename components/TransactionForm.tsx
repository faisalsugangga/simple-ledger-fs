// components/TransactionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
// Tambahkan DialogFooter di sini
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addJournalTransaction } from "@/app/actions";
import { PlusCircle, Trash2 } from "lucide-react";

type Account = { id: number; name: string };
type JournalEntry = { accountId: string; debit: string; credit: string; };

interface TransactionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function TransactionForm({ isOpen, setIsOpen }: TransactionFormProps) {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<JournalEntry[]>([
    { accountId: "", debit: "", credit: "" },
    { accountId: "", debit: "", credit: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase.from("accounts").select("id, name").order('name');
      if (data) setAccounts(data);
    };
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, supabase]);

  const handleEntryChange = (index: number, field: keyof JournalEntry, value: string) => {
    const newEntries = [...entries];
    const entry = newEntries[index];
    entry[field] = value;
    
    if (field === 'debit' && value !== '') entry.credit = '';
    if (field === 'credit' && value !== '') entry.debit = '';

    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { accountId: "", debit: "", credit: "" }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    entries.forEach(entry => {
      totalDebit += parseFloat(entry.debit) || 0;
      totalCredit += parseFloat(entry.credit) || 0;
    });
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      toast.error("Total Debit dan Kredit harus seimbang dan tidak boleh nol.");
      return;
    }

    setIsSubmitting(true);
    
    const formattedEntries = entries
      .filter(e => e.accountId && (e.debit || e.credit))
      .map(e => ({
        accountId: e.accountId,
        amount: e.debit || e.credit,
        type: e.debit ? 'debit' : 'credit' as 'debit' | 'credit'
      }));

    const result = await addJournalTransaction(description, date, formattedEntries);
    
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tambah Jurnal Transaksi Baru</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Tanggal</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Deskripsi</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Contoh: Pembelian ATK" />
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm text-muted-foreground">
                <div className="col-span-5">Akun</div>
                <div className="col-span-3 text-right">Debit</div>
                <div className="col-span-3 text-right">Kredit</div>
            </div>
            {entries.map((entry, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <div className="col-span-5">
                  <Select value={entry.accountId} onValueChange={(value) => handleEntryChange(index, 'accountId', value)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Akun..." /></SelectTrigger>
                    <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="0" value={entry.debit} onChange={(e) => handleEntryChange(index, 'debit', e.target.value)} className="text-right" />
                </div>
                <div className="col-span-3">
                  <Input type="number" placeholder="0" value={entry.credit} onChange={(e) => handleEntryChange(index, 'credit', e.target.value)} className="text-right" />
                </div>
                <div className="col-span-1">
                  {entries.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeEntry(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEntry} className="mt-2"><PlusCircle className="h-4 w-4 mr-2" /> Tambah Baris</Button>
          </div>
          
          <div className="mt-4 border-t pt-4 flex justify-between font-mono text-sm">
            <div>
              <div>Total Debit: Rp {totalDebit.toLocaleString('id-ID')}</div>
              <div>Total Kredit: Rp {totalCredit.toLocaleString('id-ID')}</div>
            </div>
            <div className={`font-bold p-2 rounded-md ${isBalanced ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
              {isBalanced ? 'SEIMBANG' : 'TIDAK SEIMBANG'}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!isBalanced || isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}