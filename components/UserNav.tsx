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
import Link from "next/link"; // <- 1. Impor Link

interface UserNavProps {
  email: string;
}

export function UserNav({ email }: UserNavProps) {
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
        {/* 2. Ubah "Profil" menjadi Link */}
        <DropdownMenuItem asChild>
          <Link href="/profile">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Pengaturan</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form action={logout} className="w-full">
            <button type="submit" className="w-full text-left">
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}