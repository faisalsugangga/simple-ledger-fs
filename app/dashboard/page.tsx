// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fungsi helper untuk format Rupiah
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  
  // Panggil fungsi RPC yang sudah kita buat
  const { data: summary, error } = await supabase.rpc('get_financial_summary');
  if (error) {
    console.error("Error fetching financial summary:", error);
    return <p>Gagal mengambil data ringkasan.</p>;
  }

  // Olah data ringkasan agar mudah digunakan
  const totals = {
    asset: summary.find(s => s.account_type === 'asset')?.total || 0,
    liability: summary.find(s => s.account_type === 'liability')?.total || 0,
    equity: summary.find(s => s.account_type === 'equity')?.total || 0,
    revenue: summary.find(s => s.account_type === 'revenue')?.total || 0,
    expense: summary.find(s => s.account_type === 'expense')?.total || 0,
  };

  const netIncome = totals.revenue - totals.expense;
  const equityBalance = totals.equity + netIncome;

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Button asChild variant="outline">
          <Link href="/">Lihat Jurnal Transaksi</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.asset)}</div>
            <p className="text-xs text-muted-foreground">Kas, Bank, Piutang</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kewajiban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.liability)}</div>
            <p className="text-xs text-muted-foreground">Utang Usaha</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
            <p className="text-xs text-muted-foreground">Dari SPP, Pendaftaran, dll.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.expense)}</div>
            <p className="text-xs text-muted-foreground">Gaji, Listrik, Sewa, dll.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 text-center p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Persamaan Akuntansi Dasar</h3>
        <p className="text-muted-foreground text-sm">Aset = Kewajiban + Ekuitas</p>
        <p className="font-mono mt-2">{formatCurrency(totals.asset)} = {formatCurrency(totals.liability)} + {formatCurrency(equityBalance)}</p>
        <p className={`mt-1 font-bold ${totals.asset === (totals.liability + equityBalance) ? 'text-green-600' : 'text-red-600'}`}>
          {totals.asset === (totals.liability + equityBalance) ? 'SEIMBANG' : 'TIDAK SEIMBANG'}
        </p>
      </div>
    </main>
  );
}