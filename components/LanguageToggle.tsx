"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react"; // Import icon Globe

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Memecah path menjadi segmen-segmen
    const segments = pathname.split('/').filter(Boolean);
    
    // Jika segmen pertama adalah 'id' atau 'en', ganti
    if (segments.length > 0 && ['id', 'en'].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      // Jika tidak ada locale di path, tambahkan di awal
      segments.unshift(newLocale);
    }
    
    // Gabungkan kembali segmen-segmen dan navigasi
    router.push(`/${segments.join('/')}`);
  };

  const currentLocale = pathname.split('/')[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('id')}>
          Bahasa Indonesia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}