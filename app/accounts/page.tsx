// app/accounts/page.tsx
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
import { AddAccountForm } from "@/components/AddAccountForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AccountsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // Panggil fungsi RPC untuk mendapatkan data hirarki
  const { data: accounts, error } = await supabase.rpc('get_accounts_hierarchy');
  if (error) {
    console.error("Error fetching accounts hierarchy:", error);
    return <p>Gagal mengambil data akun: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Akun (Chart of Accounts)</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Transaksi</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Table>
            <TableCaption>Daftar semua akun keuangan.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Saldo Normal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts?.map((account) => (
                <TableRow key={account.id}>
                  {/* Tambahkan padding kiri berdasarkan level hirarki */}
                  <TableCell 
                    className="font-medium"
                    style={{ paddingLeft: `${account.level * 1.5 + 0.5}rem` }}
                  >
                    {account.name}
                  </TableCell>
                  <TableCell className="capitalize">{account.type}</TableCell>
                  <TableCell className="capitalize">{account.balance_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          {/* Kirim daftar akun ke form sebagai props */}
          <AddAccountForm accounts={accounts || []} />
        </div>
      </div>
    </main>
  );
}