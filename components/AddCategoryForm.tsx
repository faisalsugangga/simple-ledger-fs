// components/AddCategoryForm.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

export function AddCategoryForm() {
  const supabase = createClient();
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("");

  const handleSubmit = async () => {
    if (!categoryName || !categoryType) {
      toast.error("Nama dan Tipe Kategori wajib diisi.");
      return;
    }
    
    const { error } = await supabase.from("categories").insert([{
      name: categoryName,
      type: categoryType,
    }]);

    if (error) {
      toast.error("Gagal menyimpan kategori: " + error.message);
    } else {
      toast.success("Kategori baru berhasil ditambahkan!");
      setCategoryName(""); // Reset form
      setCategoryType("");
      window.location.reload(); // Refresh halaman
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Tambah Kategori Baru</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nama Kategori</Label>
          <Input 
            id="category-name" 
            placeholder="Contoh: Transportasi" 
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-type">Tipe</Label>
          <Select onValueChange={setCategoryType} value={categoryType}>
            <SelectTrigger id="category-type">
              <SelectValue placeholder="Pilih tipe..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income (Pemasukan)</SelectItem>
              <SelectItem value="expense">Expense (Pengeluaran)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} className="w-full">Simpan Kategori</Button>
      </div>
    </div>
  );
}