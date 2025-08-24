// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserNav } from "@/components/UserNav";
import { AddTransactionButton } from "@/components/AddTransactionButton";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/PrintButton";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { TransactionFilter_DateOnly } from "@/components/TransactionFilter_DateOnly";

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "Rp 0,00";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
};

// Mendefinisikan tipe props secara terpisah
type DashboardPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const startDate = searchParams?.startDate as string | undefined;
  const endDate = searchParams?.endDate as string | undefined;

  const { data: summary, error } = await supabase.rpc('get_financial_summary_by_date', {
    start_date: startDate ? `${startDate}T00:00:00Z` : null,
    end_date: endDate ? `${endDate}T23:59:59Z` : null,
  });

  if (error) {
    console.error("Error fetching financial summary:", error);
    return <p>Gagal mengambil data ringkasan: {error.message}</p>;
  }

  const totals = {
    asset: summary?.find(s => s.account_type === 'asset')?.total || 0,
    liability: summary?.find(s => s.account_type === 'liability')?.total || 0,
    equity: summary?.find(s => s.account_type === 'equity')?.total || 0,
    revenue: summary?.find(s => s.account_type === 'revenue')?.total || 0,
    expense: summary?.find(s => s.account_type === 'expense')?.total || 0,
  };

  const netIncome = totals.revenue - totals.expense;
  const totalLiabilitiesAndEquity = totals.liability + totals.equity + netIncome;

  const periodString = startDate && endDate
    ? `Periode ${new Date(startDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })} s/d ${new Date(endDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}`
    : "Periode Keseluruhan";

  return (
    <>
      <div className="no-print">
        <main className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dashboard & Laporan</h1>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline"><Link href="/">Jurnal Transaksi</Link></Button>
                <Button asChild variant="outline"><Link href="/accounts">Daftar Akun</Link></Button>
                <PrintButton />
                <AddTransactionButton />
                <ThemeToggleButton />
                <UserNav email={user.email || ''} />
            </div>
          </div>
          
          <TransactionFilter_DateOnly />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Aset</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totals.asset)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Kewajiban</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totals.liability)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Beban</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totals.expense)}</div></CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Laba Rugi</CardTitle>
                <CardDescription>{periodString}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Pendapatan</span><span>{formatCurrency(totals.revenue)}</span></div>
                <div className="flex justify-between"><span>Beban</span><span>({formatCurrency(totals.expense)})</span></div>
                <Separator />
                <div className="flex justify-between font-bold"><span>Laba / Rugi Bersih</span><span>{formatCurrency(netIncome)}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Neraca</CardTitle>
                <CardDescription>Posisi Keuangan pada akhir periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-semibold mb-2">Aset</div>
                <div className="flex justify-between mb-4"><span>Total Aset</span><span className="font-mono">{formatCurrency(totals.asset)}</span></div>
                <div className="font-semibold mb-2">Kewajiban dan Ekuitas</div>
                <div className="flex justify-between"><span>Kewajiban</span><span className="font-mono">{formatCurrency(totals.liability)}</span></div>
                <div className="flex justify-between"><span>Ekuitas Awal</span><span className="font-mono">{formatCurrency(totals.equity)}</span></div>
                <div className="flex justify-between"><span>Laba Ditahan</span><span className="font-mono">{formatCurrency(netIncome)}</span></div>
                <Separator className="my-2"/>
                <div className="flex justify-between font-medium"><span>Total Kewajiban & Ekuitas</span><span className="font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</span></div>
              </CardContent>
              <CardFooter className="flex justify-center font-bold text-lg">
                <span className={totals.asset.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2) ? 'text-green-600' : 'text-red-600'}>
                  {totals.asset.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2) ? 'SEIMBANG' : 'TIDAK SEIMBANG'}
                </span>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>

      <div className="printable">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">STIE Indonesia Malang</h1>
              <p className="text-gray-600">Laporan Keuangan Gabungan</p>
            </div>
            <div className="text-right">
               <Image src="/logo/stie-indonesia-malang.png" alt="Logo STIE Indonesia Malang" width={150} height={50} />
              <p className="text-sm text-gray-500 mt-2">{periodString}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Laporan Laba Rugi</h2>
              <table className="w-full">
                <tbody>
                  <tr><td className="py-2">Pendapatan</td><td className="text-right">{formatCurrency(totals.revenue)}</td></tr>
                  <tr><td className="py-2">Beban</td><td className="text-right">({formatCurrency(totals.expense)})</td></tr>
                  <tr><td colSpan={2}><hr className="my-2"/></td></tr>
                  <tr className="font-bold"><td className="py-2">Laba / Rugi Bersih</td><td className="text-right">{formatCurrency(netIncome)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Neraca</h2>
              <table className="w-full">
                <tbody>
                  <tr className="font-semibold"><td colSpan={2} className="pb-2">Aset</td></tr>
                  <tr><td className="py-2 pl-4">Total Aset</td><td className="text-right font-mono">{formatCurrency(totals.asset)}</td></tr>
                  <tr className="font-semibold"><td colSpan={2} className="pt-4 pb-2">Kewajiban dan Ekuitas</td></tr>
                  <tr><td className="py-2 pl-4">Kewajiban</td><td className="text-right font-mono">{formatCurrency(totals.liability)}</td></tr>
                  <tr><td className="py-2 pl-4">Ekuitas Awal</td><td className="text-right font-mono">{formatCurrency(totals.equity)}</td></tr>
                  <tr><td className="py-2 pl-4">Laba Ditahan</td><td className="text-right font-mono">{formatCurrency(netIncome)}</td></tr>
                  <tr><td colSpan={2}><hr className="my-2"/></td></tr>
                  <tr className="font-medium"><td className="py-2">Total Kewajiban & Ekuitas</td><td className="text-right font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</td></tr>
                </tbody>
              </table>
               <div className="text-center pt-6 font-bold text-lg">
                  <span className={totals.asset.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2) ? 'text-green-600' : 'text-red-600'}>
                    {totals.asset.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2) ? 'SEIMBANG' : 'TIDAK SEIMBANG'}
                  </span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}