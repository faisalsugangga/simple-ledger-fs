// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"], // Perbaikan: Menghapus subset 'vietnamese'
});

export const metadata: Metadata = {
  title: "Aplikasi Keuangan",
  description: "Aplikasi untuk mencatat keuangan universitas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const printStyles = `
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color: black !important;
        background-color: white !important;
      }
      .no-print {
        display: none !important;
      }
      .printable {
        display: block !important;
      }
      /* Perbaikan untuk memastikan elemen dark mode terlihat baik saat dicetak */
      .dark .text-muted-foreground {
        color: #4b5563 !important;
      }
      .dark .bg-muted\\/50 {
        background-color: #f3f4f6 !important;
      }
      .dark .border, .dark .border-b, .dark .border-b-2 {
        border-color: #d1d5db !important;
      }
      /* Perbaikan: Aturan cetak untuk logo */
      .printable-logo {
        width: 150px !important;
        height: 50px !important;
        object-fit: contain !important;
      }
    }
    @media screen {
      .printable {
        display: none !important;
      }
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{printStyles}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}