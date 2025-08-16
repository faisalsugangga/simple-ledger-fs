// components/AddAccountForm.tsx
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

export function AddAccountForm() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [balanceType, setBalanceType] = useState("");

  const handleSubmit = async () => {
    if (!name || !type || !balanceType) {
      toast.error("Semua field wajib diisi.");
      return;
    }
    
    const { error } = await supabase.from("accounts").insert([{
      name,
      type,
      balance_type: balanceType,
    }]);

    if (error) {
      toast.error("Gagal menyimpan akun: " + error.message);
    } else {
      toast.success("Akun baru berhasil ditambahkan!");
      setName("");
      setType("");
      setBalanceType("");
      window.location.reload();
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Tambah Akun Baru</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="account-name">Nama Akun</Label>
          <Input 
            id="account-name" 
            placeholder="Contoh: Kas, Bank BCA, dll." 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-type">Tipe Akun</Label>
          <Select onValueChange={setType} value={type}>
            <SelectTrigger id="account-type">
              <SelectValue placeholder="Pilih tipe..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">Aset</SelectItem>
              <SelectItem value="liability">Kewajiban</SelectItem>
              <SelectItem value="equity">Ekuitas</SelectItem>
              <SelectItem value="revenue">Pendapatan</SelectItem>
              <SelectItem value="expense">Beban</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance-type">Saldo Normal</Label>
          <Select onValueChange={setBalanceType} value={balanceType}>
            <SelectTrigger id="balance-type">
              <SelectValue placeholder="Pilih saldo normal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} className="w-full">Simpan Akun</Button>
      </div>
    </div>
  );
}