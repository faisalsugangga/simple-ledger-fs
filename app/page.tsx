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
import { Pagination } from "@/components/Pagination";

// Definisikan opsi jumlah item per halaman
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

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

  const currentPage = Number(searchParams?.page) || 1;
  const perPage = Number(searchParams?.perPage) || DEFAULT_ITEMS_PER_PAGE;
  const startRange = (currentPage - 1) * perPage;
  const endRange = startRange + perPage - 1;

  // Query untuk mendapatkan total count, menerapkan filter yang sama
  let countQuery = supabase.from("transactions_with_details").select("*", { count: "exact", head: true });
  if (searchParams?.startDate) {
    countQuery = countQuery.gte("date", searchParams.startDate as string);
  }
  if (searchParams?.endDate) {
    countQuery = countQuery.lte("date", searchParams.endDate as string);
  }
  if (searchParams?.accountId) {
    const accountIds = (searchParams.accountId as string).split(',');
    // Perubahan: Menggunakan operator `overlaps` untuk logika OR
    // @ts-ignore
    countQuery = countQuery.overlaps("account_ids", accountIds);
  }
  const { count } = await countQuery;
  const totalPages = Math.ceil((count || 0) / perPage);

  // Query utama untuk mengambil data transaksi untuk halaman saat ini
  let dataQuery = supabase
    .from("transactions_with_details")
    .select("*")
    .order("date", { ascending: false })
    .range(startRange, endRange);

  if (searchParams?.startDate) {
    dataQuery = dataQuery.gte("date", searchParams.startDate as string);
  }
  if (searchParams?.endDate) {
    dataQuery = dataQuery.lte("date", searchParams.endDate as string);
  }
  if (searchParams?.accountId) {
    const accountIds = (searchParams.accountId as string).split(',');
    // Perubahan: Menggunakan operator `overlaps` untuk logika OR
    // @ts-ignore
    dataQuery = dataQuery.overlaps("account_ids", accountIds);
  }

  const { data: transactions, error } = await dataQuery;

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
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/accounts">Daftar Akun</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/import">Import / Export</Link>
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
                  <TableRow
                    key={entry.id}
                    className={
                      index === transaction.entries.length - 1
                        ? "border-b-2 border-gray-200 dark:border-gray-800"
                        : "border-b-0"
                    }
                  >
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
      
      <Pagination 
        totalPages={totalPages} 
        currentPage={currentPage} 
        perPage={perPage} 
        perPageOptions={ITEMS_PER_PAGE_OPTIONS}
      />
    </main>
  );
}