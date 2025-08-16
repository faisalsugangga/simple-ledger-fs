// app/reports/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Fungsi helper untuk format Rupiah
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
};

export default async function ReportsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  
  const { data: summary, error } = await supabase.rpc('get_financial_summary');
  if (error) {
    console.error("Error fetching financial summary:", error);
    return <p>Gagal mengambil data ringkasan.</p>;
  }

  // Olah data ringkasan
  const totals = {
    revenue: summary.find(s => s.account_type === 'revenue')?.total || 0,
    expense: summary.find(s => s.account_type === 'expense')?.total || 0,
    asset: summary.find(s => s.account_type === 'asset')?.total || 0,
    liability: summary.find(s => s.account_type === 'liability')?.total || 0,
    equity: summary.find(s => s.account_type === 'equity')?.total || 0,
  };

  const netIncome = totals.revenue - totals.expense;
  const totalLiabilitiesAndEquity = totals.liability + totals.equity + netIncome;

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Laporan Keuangan</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Jurnal</Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Laporan Laba Rugi */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Laba Rugi</CardTitle>
            <CardDescription>Periode Berjalan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Pendapatan</span>
              <span>{formatCurrency(totals.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Beban</span>
              <span>({formatCurrency(totals.expense)})</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Laba / Rugi Bersih</span>
              <span>{formatCurrency(netIncome)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Neraca */}
        <Card>
          <CardHeader>
            <CardTitle>Neraca</CardTitle>
            <CardDescription>Posisi Keuangan Saat Ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-semibold mb-2">Aset</div>
            <div className="flex justify-between mb-4">
              <span>Total Aset</span>
              <span className="font-mono">{formatCurrency(totals.asset)}</span>
            </div>
            
            <div className="font-semibold mb-2">Kewajiban dan Ekuitas</div>
            <div className="flex justify-between">
              <span>Kewajiban</span>
              <span className="font-mono">{formatCurrency(totals.liability)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ekuitas Awal</span>
               <span className="font-mono">{formatCurrency(totals.equity)}</span>
            </div>
             <div className="flex justify-between">
              <span>Laba Ditahan</span>
               <span className="font-mono">{formatCurrency(netIncome)}</span>
            </div>
            <Separator className="my-2"/>
             <div className="flex justify-between font-medium">
              <span>Total Kewajiban & Ekuitas</span>
               <span className="font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center font-bold text-lg">
             <span className={totals.asset === totalLiabilitiesAndEquity ? 'text-green-600' : 'text-red-600'}>
              {totals.asset === totalLiabilitiesAndEquity ? 'SEIMBANG' : 'TIDAK SEIMBANG'}
             </span>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}