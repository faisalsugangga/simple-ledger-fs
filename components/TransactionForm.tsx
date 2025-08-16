"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Category = { id: number; name: string };
type Transaction = { id: number; description: string; amount: number; category_id: number; created_at: string };

interface TransactionFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactionToEdit?: Transaction | null;
}

// Fungsi helper untuk format Rupiah
const formatRupiah = (value: string) => {
  if (!value) return "";
  const numberValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  if (isNaN(numberValue)) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
};

export function TransactionForm({ isOpen, setIsOpen, transactionToEdit }: TransactionFormProps) {
  const supabase = createClient();
  const [description, setDescription] = useState("");
  // State 'amount' sekarang menyimpan nilai angka mentah sebagai string
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    if (transactionToEdit && isOpen) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setSelectedCategory(String(transactionToEdit.category_id));
      if (transactionToEdit.created_at) {
        setDate(new Date(transactionToEdit.created_at).toISOString().split('T')[0]);
      }
    } else {
      setDescription("");
      setAmount("");
      setSelectedCategory("");
      setDate("");
    }
  }, [transactionToEdit, isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ambil nilai input dan hapus semua karakter non-numerik
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setAmount(numericValue);
  };

  const handleSubmit = async () => {
    if (!description || !amount || !selectedCategory || !date) {
      toast.error("Semua field wajib diisi, termasuk tanggal.");
      return;
    }

    const transactionData = {
      description: description,
      amount: parseInt(amount), // Pastikan amount adalah angka saat submit
      category_id: parseInt(selectedCategory),
      created_at: date,
    };

    // ... (logika submit tetap sama)
    if (transactionToEdit) {
      const { error } = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", transactionToEdit.id);

      if (error) {
        toast.error("Gagal memperbarui data: " + error.message);
      } else {
        toast.success("Data berhasil diperbarui!");
        setIsOpen(false);
        window.location.reload();
      }
    } else {
      const { error } = await supabase.from("transactions").insert([transactionData]);

      if (error) {
        toast.error("Gagal menyimpan data: " + error.message);
      } else {
        toast.success("Data berhasil disimpan!");
        setIsOpen(false);
        window.location.reload();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? "Edit Transaksi" : "Tambah Transaksi Baru"}</DialogTitle>
          <DialogDescription>
            {transactionToEdit ? "Ubah detail transaksi di bawah ini." : "Isi detail transaksi di sini."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Deskripsi</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Jumlah</Label>
            {/* Input diubah menjadi 'text' dan menggunakan handler & value baru */}
            <Input
              id="amount"
              type="text"
              value={formatRupiah(amount)}
              onChange={handleAmountChange}
              className="col-span-3"
              placeholder="Rp 0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Tanggal</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Kategori</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}