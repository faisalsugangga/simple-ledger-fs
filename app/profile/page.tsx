// app/profile/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUser({
        id: user.id,
        email: user.email!,
      });
    };

    fetchUser();
  }, [supabase, router]);

  const handleChangePassword = async () => {
    if (!password) {
      toast.error("Password tidak boleh kosong.");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Gagal memperbarui password: " + error.message);
    } else {
      toast.success("Password berhasil diperbarui!");
      setPassword("");
    }
    setIsLoading(false);
  };

  if (!user) {
    return (
      <main className="container mx-auto p-8 text-center">
        <p>Memuat profil...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Jurnal</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleChangePassword} disabled={isLoading} variant="destructive">
              {isLoading ? "Memperbarui..." : "Ubah Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}