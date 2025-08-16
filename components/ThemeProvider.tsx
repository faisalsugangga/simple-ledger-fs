// components/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Komponen ini menggunakan library next-themes untuk mengelola state tema (light/dark)
  // dan secara otomatis menambahkan class 'dark' ke elemen <html> jika dark mode aktif.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
