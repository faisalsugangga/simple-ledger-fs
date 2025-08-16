// components/TransactionActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client"; // <- PASTIKAN IMPORT DARI SINI
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { TransactionForm } from "./TransactionForm.tsx";

type Transaction = { id: number; description: string; amount: number; category_id: number, created_at: string };

export function TransactionActions({ transaction }: { transaction: Transaction }) {
  const supabase = createClient(); // <- PASTIKAN ADA BARIS INI
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transaction.id);

    if (error) {
      toast.error("Gagal menghapus data: " + error.message);
    } else {
      toast.success("Transaksi berhasil dihapus.");
      window.location.reload();
    }
  };

  return (
    <>
      <TransactionForm 
        isOpen={isEditDialogOpen} 
        setIsOpen={setIsEditDialogOpen} 
        transactionToEdit={transaction}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-500 focus:text-red-500"
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}