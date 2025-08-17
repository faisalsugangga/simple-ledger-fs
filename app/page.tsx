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
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getActiveWorkspaceId } from "@/app/actions";
import { TransactionActions } from "@/components/TransactionActions";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const activeWorkspaceId = await getActiveWorkspaceId();
  if (!activeWorkspaceId) return redirect("/select-workspace");

  const sortBy = (searchParams?.sortBy as string) || "date";
  const sortOrderAsc = (searchParams?.sortOrder as string) === "asc";

  const currentPage = Number(searchParams?.page) || 1;
  const perPage = Number(searchParams?.perPage) || DEFAULT_ITEMS_PER_PAGE;
  const startRange = (currentPage - 1) * perPage;

  const startDate = searchParams?.startDate || null;
  const endDate = searchParams?.endDate || null;
  const accountIdsParam = searchParams?.accountId || null;

  let transactions: any[] = [];
  let countResult: number | undefined;
  let error: any;

  // Parse account IDs filter
  let accountIds: number[] = [];
  if (typeof accountIdsParam === "string") {
    try {
      accountIds = JSON.parse(accountIdsParam);
      if (!Array.isArray(accountIds)) accountIds = [];
    } catch {
      accountIds = [];
    }
  }

  try {
    if (accountIds.length > 0) {
      // Call RPC filter by account IDs
      const { data, error: rpcError } = await supabase.rpc("filter_transactions_by_account_ids", {
        p_account_ids: accountIds,
        p_workspace: activeWorkspaceId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_sort_col: sortBy,
        p_sort_asc: sortOrderAsc,
        p_offset_val: startRange,
        p_limit_val: perPage,
      });

      if (rpcError) throw rpcError;
      transactions = data ?? [];
      countResult = transactions.length; // For production better create separate count function
    } else {
      // Query without filter accounts
      const { data, count, error: err } = await supabase
        .from("transactions_with_details")
        .select("*", { count: "exact" })
        .eq("workspace_id", activeWorkspaceId)
        .gte(startDate ? "date" : "", startDate || "")
        .lte(endDate ? "date" : "", endDate || "")
        .order(sortBy, { ascending: sortOrderAsc })
        .range(startRange, startRange + perPage -1);

      if (err) throw err;
      transactions = data ?? [];
      countResult = count ?? transactions.length;
    }
  } catch (e) {
    error = e;
  }

  if (error) {
    console.error("Error fetching transactions:", error);
    return <p>Gagal mengambil data: {error.message ?? String(error)}</p>;
  }

  const totalPages = Math.ceil((countResult || transactions.length || 0) / perPage);

  const checkBalance = (entries: any[]) => {
    let debit = 0;
    let credit = 0;
    entries.forEach(e => {
      if (e.type === "debit") debit += e.amount;
      else if (e.type === "credit") credit += e.amount;
    });
    return debit.toFixed(2) === credit.toFixed(2);
  };

  const createSortUrl = (column: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const newSortOrder = sortBy === column && sortOrderAsc ? "desc" : "asc";
    params.set("sortBy", column);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1");
    return `/?${params.toString()}`;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    return sortOrderAsc ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <main className="container mx-auto p-8">
      <NotificationHandler />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jurnal Transaksi</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
          <Button asChild variant="outline"><Link href="/accounts">Daftar Akun</Link></Button>
          <Button asChild variant="outline"><Link href="/import">Import / Export</Link></Button>
          <AddTransactionButton />
          <LanguageToggle />
          <ThemeToggleButton />
          <UserNav email={user.email || ""} />
        </div>
      </div>

      <TransactionFilters searchParams={searchParams} />

      <Table>
        <TableCaption>Daftar semua jurnal transaksi.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">
              <Link href={createSortUrl("is_balanced")} className="flex items-center justify-center">
                Status{getSortIcon("is_balanced")}
              </Link>
            </TableHead>
            <TableHead className="w-[120px]">
              <Link href={createSortUrl("date")} className="flex items-center">
                Tanggal{getSortIcon("date")}
              </Link>
            </TableHead>
            <TableHead>
              <Link href={createSortUrl("description")} className="flex items-center">
                Keterangan{getSortIcon("description")}
              </Link>
            </TableHead>
            <TableHead className="text-right w-[170px]">Debit</TableHead>
            <TableHead className="text-right w-[170px]">Kredit</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.length > 0 ? (
            transactions.map(transaction => {
              const isBalanced = checkBalance(transaction.entries);
              return (
                <React.Fragment key={transaction.id}>
                  <TableRow className={`bg-muted/50 font-medium hover:bg-muted/50 border-b-0 ${isBalanced ? "" : "text-red-500"}`}>
                    <TableCell className="py-3 text-center">
                      <div className={`size-3 rounded-full mx-auto ${isBalanced ? "bg-green-500" : "bg-red-500"}`} />
                    </TableCell>
                    <TableCell className="py-3">{new Date(transaction.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}</TableCell>
                    <TableCell colSpan={3} className="py-3">{transaction.description}</TableCell>
                    <TableCell className="py-3"><TransactionActions transaction={transaction} /></TableCell>
                  </TableRow>

                  {transaction.entries.map((entry:any, idx:number) => (
                    <TableRow key={entry.id} className={idx === transaction.entries.length -1 ? "border-b-2 border-gray-200 dark:border-gray-800" : "border-b-0"}>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className={entry.type === "credit" ? "pl-8 text-gray-600 dark:text-gray-400" : "text-gray-600 dark:text-gray-400"}>{entry.account_name}</TableCell>
                      <TableCell className="text-right font-mono">{entry.type==="debit" ? `Rp ${Number(entry.amount).toLocaleString("id-ID")}` : ""}</TableCell>
                      <TableCell className="text-right font-mono">{entry.type==="credit" ? `Rp ${Number(entry.amount).toLocaleString("id-ID")}` : ""}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow><TableCell colSpan={6} className="h-24 text-center">Tidak ada transaksi yang cocok dengan filter.</TableCell></TableRow>
          )}
        </TableBody>

      </Table>

      <Pagination totalPages={totalPages} currentPage={currentPage} perPage={perPage} perPageOptions={ITEMS_PER_PAGE_OPTIONS} />

    </main>
  );
}
