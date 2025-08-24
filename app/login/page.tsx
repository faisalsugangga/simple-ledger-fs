"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setErrorMessage(message);
    }
  }, [searchParams]);

  // PERUBAHAN 1: Ganti cara fungsi ini dipanggil
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah form submit default
    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result.success) {
      toast.success(result.message);
      // Menggunakan router.push() akan mengarahkan setelah notifikasi tampil
      router.push("/select-workspace");
    } else {
      setErrorMessage(result.message);
      setIsLoading(false); // Hentikan loading jika gagal
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo/simple-ledger-logo.png"
            alt="Logo"
            width={150}
            height={50}
            className="mb-4"
            priority
          />
          <h1 className="text-xl font-bold text-card-foreground">
            Simple Ledger
          </h1>
          <p className="text-md mt-1 text-muted-foreground">Clear Records, Better Decisions</p>
        </div>

        {/* PERUBAHAN 2: Ganti `action` menjadi `onSubmit` */}
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Alamat Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="emailanda@domain.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}