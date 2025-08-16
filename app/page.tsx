// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
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
import { TransactionFilters } from "@/components/TransactionFilters";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  let query = supabase.from('transactions_with_details').select('*');

  if (searchParams?.startDate) {
    query = query.gte('date', searchParams.startDate as string);
  }
  if (searchParams?.endDate) {
    query = query.lte('date', searchParams.endDate as string);
  }
  if (searchParams?.accountId) {
    // @ts-ignore 
    query = query.contains('account_ids', [searchParams.accountId]);
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error("Error fetching from view:", error);
    return <p>Gagal mengambil data: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <NotificationHandler />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jurnal Transaksi</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
          <Button asChild variant="outline"><Link href="/reports">Laporan</Link></Button>
          <Button asChild variant="outline"><Link href="/logs">Log Aktivitas</Link></Button>
          <Button asChild variant="outline"><Link href="/accounts">Daftar Akun</Link></Button>
          <AddTransactionButton />
          <UserNav email={user.email || ''} />
        </div>
      </div>

      <TransactionFilters />
      
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
              <React.Fragment key={transaction.id}>
                <TableRow className="bg-muted/50 font-bold hover:bg-muted/50">
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
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Tidak ada transaksi yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}