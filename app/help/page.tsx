// app/help/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HelpPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pusat Bantuan & Panduan</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Jurnal</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang di Aplikasi Keuangan STIE Indonesia Malang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aplikasi ini dirancang untuk membantu Anda mencatat transaksi keuangan menggunakan metode akuntansi double-entry (jurnal berpasangan). Panduan di bawah ini akan membantu Anda memahami konsep dasar dan alur penggunaan aplikasi.
          </p>
          <Accordion type="single" collapsible className="w-full mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Bagaimana Cara Membaca Jurnal Transaksi?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>Setiap transaksi keuangan selalu memengaruhi minimal dua akun. Prinsip utamanya adalah total **Debit** harus selalu sama dengan total **Kredit**.</p>
                  <p>Anggap saja:</p>
                  <ul className="list-disc pl-5">
                    <li><strong>Debit:</strong> Untuk apa uang digunakan (Beban bertambah, Aset bertambah).</li>
                    <li><strong>Kredit:</strong> Dari mana uang berasal (Pendapatan bertambah, Aset berkurang).</li>
                  </ul>
                  <p className="font-medium pt-2">Contoh: &quot;Pembayaran Gaji Dosen Rp 8.000.000 via Bank&quot;</p>
                   <ul className="list-disc pl-5">
                    <li>**Debit:** Akun &apos;Beban Gaji&apos; bertambah Rp 8.000.000 (uang digunakan untuk membayar gaji).</li>
                    <li>**Kredit:** Akun &apos;Bank&apos; berkurang Rp 8.000.000 (uang berasal dari rekening bank).</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Bagaimana Cara Membaca Laporan Keuangan?</AccordionTrigger>
              <AccordionContent>
                 <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">1. Laporan Laba Rugi (Income Statement)</h4>
                        <p className="text-sm text-muted-foreground">Laporan ini menunjukkan kinerja keuangan dalam satu periode. Rumus dasarnya adalah:</p>
                        <p className="font-mono p-2 bg-muted rounded-md mt-1">Total Pendapatan - Total Beban = Laba/Rugi Bersih</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">2. Neraca (Balance Sheet)</h4>
                        <p className="text-sm text-muted-foreground">Laporan ini menunjukkan posisi keuangan pada satu titik waktu. Rumus dasarnya harus selalu seimbang:</p>
                        <p className="font-mono p-2 bg-muted rounded-md mt-1">Total Aset = Total Kewajiban + Total Ekuitas</p>
                         <ul className="list-disc pl-5 mt-2 text-sm">
                            <li><strong>Aset:</strong> Semua yang dimiliki (Kas, Bank, Piutang).</li>
                            <li><strong>Kewajiban:</strong> Semua utang kepada pihak lain.</li>
                            <li><strong>Ekuitas:</strong> Modal pemilik ditambah (atau dikurangi) laba/rugi.</li>
                        </ul>
                    </div>
                 </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Apa Alur Penggunaan Aplikasi Sehari-hari?</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Siapkan Daftar Akun:</strong> Sebelum memulai, pastikan semua akun yang Anda butuhkan sudah terdaftar di halaman <Link href="/accounts" className="underline text-blue-600">Daftar Akun</Link>. Anda hanya perlu melakukan ini sekali di awal atau saat ada akun baru.</li>
                  <li><strong>Catat Transaksi Baru:</strong> Di halaman utama, klik &quot;Tambah Transaksi&quot;. Isi tanggal, deskripsi, lalu masukkan entri-entri jurnal. Pastikan total Debit dan Kredit seimbang sebelum menyimpan.</li>
                  <li><strong>Lihat Hasilnya:</strong> Setelah disimpan, transaksi baru akan muncul di Jurnal Transaksi. Nilai total di halaman Dashboard dan Laporan juga akan otomatis ter-update.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
                <AccordionTrigger>Kenapa Transaksi Saya &quot;Tidak Seimbang&quot;?</AccordionTrigger>
                <AccordionContent>
                    <p>Setiap transaksi harus memiliki total Debit yang sama persis dengan total Kredit. Jika form Anda menunjukkan status &quot;Tidak Seimbang&quot;, periksa kembali angka yang Anda masukkan di setiap baris. Pastikan jumlah semua angka di kolom Debit sama dengan jumlah semua angka di kolom Kredit.</p>
                </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}