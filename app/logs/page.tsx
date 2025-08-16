// app/logs/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LogsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const { data: logs, error } = await supabase.from("logs").select('*').order('created_at', { ascending: false });
  if (error) {
    return <p>Gagal mengambil data log: {error.message}</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Log Aktivitas</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Transaksi</Link>
        </Button>
      </div>
      
      <Table>
        <TableCaption>Catatan semua perubahan data di sistem.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Tabel</TableHead>
            <TableHead>Record ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.created_at).toLocaleString('id-ID')}
              </TableCell>
              <TableCell>{log.user_email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                  log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {log.action}
                </span>
              </TableCell>
              <TableCell>{log.table_name}</TableCell>
              <TableCell>{log.record_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}