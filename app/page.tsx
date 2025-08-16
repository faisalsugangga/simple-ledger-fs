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
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { PaginationControls } from "@/components/PaginationControls"; // 1. Impor komponen paginasi

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // 2. Logika Paginasi
  const page = searchParams?.['page'] ? parseInt(searchParams['page'] as string) : 1;
  const ITEMS_PER_PAGE = 10;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Buat query dasar yang bisa digunakan kembali
  let baseQuery = supabase.from("transactions_with_details").select();

  // Terapkan filter yang sama ke query dasar
  if (searchParams?.startDate) {
    baseQuery = baseQuery.gte("date", searchParams.startDate as string);
  }
  if (searchParams?.endDate) {
    baseQuery = baseQuery.lte("date", searchParams.endDate as string);
  }
  if (searchParams?.accountId) {
    // @ts-ignore
    baseQuery = baseQuery.contains("account_ids", [searchParams.accountId]);
  }

  // 3. Ambil total data untuk menghitung jumlah halaman
  const { count, error: countError } = await baseQuery.select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error("Error fetching count:", countError);
    return <p>Gagal mengambil data: {countError.message}</p>;
  }

  // 4. Ambil data untuk halaman saat ini menggunakan .range()
  const { data: transactions, error } = await baseQuery
    .order('date', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching from view:", error);
    return <p>Gagal mengambil data: {error.message}</p>;
  }
  
  const hasNextPage = (count ?? 0) > to + 1;
  const hasPrevPage = from > 0;

  return (
    <main className="container mx-auto p-8">
      <NotificationHandler />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jurnal Transaksi</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/accounts">Daftar Akun</Link>
          </Button>
          <AddTransactionButton />
          <ThemeToggleButton />
          <UserNav email={user.email || ""} />
        </div>
      </div>

      <TransactionFilters />

      <Table>
        <TableCaption>Daftar semua jurnal transaksi.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right w-[170px]">Debit</TableHead>
            <TableHead className="text-right w-[170px]">Kredit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction: any) => (
              <React.Fragment key={transaction.id}>
                <TableRow className="bg-muted/50 font-medium hover:bg-muted/50 border-b-0">
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell colSpan={3}>{transaction.description}</TableCell>
                </TableRow>
                {transaction.entries.map((entry: any, index: number) => (
                  <TableRow key={entry.id} className={index === transaction.entries.length - 1 ? 'border-b-2 border-gray-200 dark:border-gray-800' : 'border-b-0'}>
                    <TableCell></TableCell>
                    <TableCell
                      className={
                        entry.type === "credit"
                          ? "pl-8 text-gray-600 dark:text-gray-400"
                          : "text-gray-600 dark:text-gray-400"
                      }
                    >
                      {entry.account_name}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.type === "debit"
                        ? `Rp ${Number(entry.amount).toLocaleString("id-ID")}`
                        : ""}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.type === "credit"
                        ? `Rp ${Number(entry.amount).toLocaleString("id-ID")}`
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Tidak ada transaksi yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* 5. Tampilkan komponen paginasi di bawah tabel */}
      <PaginationControls
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        totalCount={count ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </main>
  );
}
