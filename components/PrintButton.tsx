// components/PrintButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    // Memanggil fungsi print bawaan browser
    window.print();
  };

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Cetak Laporan
    </Button>
  );
}
