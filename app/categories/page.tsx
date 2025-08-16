import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddCategoryForm } from "@/components/AddCategoryForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryActions } from "@/components/CategoryActions";

export default async function CategoriesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { data: categories, error } = await supabase.from("categories").select('*').order('name', { ascending: true });
  if (error) {
    return <p>Gagal mengambil data kategori: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Kategori</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Transaksi</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Table>
            <TableCaption>Daftar semua kategori transaksi.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.type}</TableCell>
                  <TableCell className="text-right">
                    {/* Ganti category_id menjadi category.id */}
                    <CategoryActions categoryId={category.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <AddCategoryForm />
        </div>
      </div>
    </main>
  );
}