// components/AddTransactionButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./TransactionForm";

export function AddTransactionButton() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)}>Tambah Transaksi</Button>
      <TransactionForm 
        isOpen={isAddDialogOpen} 
        setIsOpen={setIsAddDialogOpen} 
      />
    </>
  );
}