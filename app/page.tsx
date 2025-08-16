// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { NotificationHandler } from "@/components/NotificationHandler";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/UserNav";

export default async function HomePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { data: transactions, error } = await supabase
    .from('transactions_with_details')
    .select('*');

  if (error) {
    console.error("Error fetching from view:", error);
    return <p>Gagal mengambil data: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <NotificationHandler />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jurnal Transaksi</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard">Lihat Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/accounts">Daftar Akun</Link>
          </Button>
          <AddTransactionButton />
          <UserNav email={user.email || ''} />
        </div>
      </div>
      
      <Table>
        <TableCaption>Daftar semua jurnal transaksi.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead>Deskripsi / Akun</TableHead>
            <TableHead className="w-[150px]">Dicatat oleh</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead className="text-right">Kredit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction: any) => (
              <>
                <TableRow key={transaction.id} className="bg-muted/50 font-bold hover:bg-muted/50">
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-gray-500">{transaction.creator_email}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
                {transaction.entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className={entry.type === 'credit' ? 'pl-8 text-gray-600' : 'text-gray-600'}>
                      {entry.account_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.type === 'debit' ? `Rp ${Number(entry.amount).toLocaleString('id-ID')}` : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.type === 'credit' ? `Rp ${Number(entry.amount).toLocaleString('id-ID')}` : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Belum ada transaksi.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}