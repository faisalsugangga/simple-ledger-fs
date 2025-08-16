// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link"; // <- Penambahan import
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTransactionButton } from "@/components/AddTransactionButton";
import { TransactionActions } from "@/components/TransactionActions";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationHandler } from "@/components/NotificationHandler";

type Transaction = { id: number; description: string; amount: number; category_id: number, created_at: string };

export default async function HomePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error && !transactions) {
    return <p>Gagal mengambil data: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <NotificationHandler />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Transaksi</h1>
        <div className="flex items-center gap-4">
          <Link href="/categories" className="text-sm text-gray-500 underline hover:text-black">
            Kelola Kategori
          </Link> {/* <- Link baru ditambahkan di sini */}
          <span className="text-sm text-gray-500">{user.email}</span>
          <AddTransactionButton />
          <LogoutButton />
        </div>
      </div>
      
      <Table>
        <TableCaption>Daftar semua transaksi keuangan.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction: any) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  Rp {transaction.amount.toLocaleString('id-ID')}
                </TableCell>
                <TableCell className="text-right">
                  <TransactionActions transaction={transaction} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Belum ada transaksi.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}