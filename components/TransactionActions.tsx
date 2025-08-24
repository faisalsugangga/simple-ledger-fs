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
import { createClient } from "@/lib/supabase/client";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { TransactionForm } from "./TransactionForm";

// Tipe ini disesuaikan agar cocok dengan struktur data lengkap dari app/page.tsx
type Transaction = {
  id: number;
  description: string;
  date: string;
  entries: {
    id: number;
    account_id: number;
    amount: number;
    type: "debit" | "credit";
  }[];
};

export function TransactionActions({ transaction }: { transaction: Transaction }) {
  const supabase = createClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      return;
    }

    // Menggunakan RPC untuk memastikan entri jurnal terkait juga terhapus
    const { error } = await supabase.rpc('delete_transaction_and_entries', { 
      p_transaction_id: transaction.id 
    });

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