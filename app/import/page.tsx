// app/import/page.tsx
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImportForm } from "@/components/ImportForm";
import { ExportForm } from "@/components/ExportForm"; // 1. Impor komponen ekspor
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ImportPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkUser();
  }, [supabase, router]);

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Bagian Import */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Import Transaksi</CardTitle>
            <CardDescription>
              Unggah file Excel (.xlsx) atau CSV (.csv) untuk mengimpor banyak transaksi sekaligus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportForm />
          </CardContent>
        </Card>

        {/* Bagian Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Export Transaksi</CardTitle>
            <CardDescription>
              Unduh data transaksi dalam format Excel (.xlsx) berdasarkan rentang tanggal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportForm />
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">Kembali ke Jurnal</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
