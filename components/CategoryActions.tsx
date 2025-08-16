"use client";

import { deleteCategory } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CategoryActions({ categoryId }: { categoryId: number }) {
  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      Hapus
    </Button>
  );
}