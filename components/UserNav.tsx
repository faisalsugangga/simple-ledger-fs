// components/UserNav.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { CircleUser } from "lucide-react";
import { logout } from "@/app/actions";
import Link from "next/link";
import { useTheme } from "next-themes";

interface UserNavProps {
  email: string;
}

export function UserNav({ email }: UserNavProps) {
  const { setTheme } = useTheme();

  // Fungsi untuk menangani logout tanpa mereset tema
  const handleLogout = async () => {
    // Baris setTheme("light"); telah dihapus.
    // Sekarang hanya memanggil server action untuk logout.
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Login sebagai</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/logs">Log Aktivitas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help">Bantuan</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Mengganti <form> dengan onClick yang memanggil handleLogout */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}