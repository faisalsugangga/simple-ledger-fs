// app/import/page.tsx
"use client"; // Baris ini sangat penting, pastikan ada di paling atas.

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImportForm } from "@/components/ImportForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ImportPage() {
  const router = useRouter();
  const supabase = createClient();

  // Pengecekan otentikasi pengguna di sisi client
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Import Transaksi dari Excel</CardTitle>
          <CardDescription>
            Unggah file Excel (.xlsx) atau CSV (.csv) untuk mengimpor banyak transaksi sekaligus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportForm />
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/">Kembali ke Jurnal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
