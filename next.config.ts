import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan konfigurasi i18n untuk mengaktifkan routing bahasa
  i18n: {
    locales: ['id', 'en'], // Mendefinisikan bahasa yang didukung
    defaultLocale: 'id', // Bahasa default jika tidak ada di URL
    localeDetection: false, // Nonaktifkan deteksi bahasa otomatis
  },
};

export default nextConfig;