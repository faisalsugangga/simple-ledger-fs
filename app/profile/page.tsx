// app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="container mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold">Profil Pengguna</h1>
      <p className="mt-4">Login sebagai: <strong>{user.email}</strong></p>
      <p className="mt-2 text-muted-foreground">Fitur profil lengkap sedang dalam pengembangan.</p>
      <Button asChild variant="outline" className="mt-8">
          <Link href="/">Kembali ke Jurnal</Link>
      </Button>
    </main>
  );
}