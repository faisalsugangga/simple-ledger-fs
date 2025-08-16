// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Tipe untuk entri jurnal yang dikirim dari form
type JournalEntry = {
  accountId: string;
  amount: string;
  type: 'debit' | 'credit';
};

// Fungsi login (tetap sama)
export async function login(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, message: "Email atau password salah." };
  }
  revalidatePath("/", "layout");
  return { success: true, message: "Login berhasil!" };
}

// Fungsi logout (tetap sama)
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Aksi baru untuk membuat Jurnal Transaksi
export async function addJournalTransaction(
  description: string,
  date: string,
  entries: JournalEntry[]
): Promise<{ success: boolean; message: string }> {
  
  // Validasi di server
  if (!description || !date || entries.length < 2) {
    return { success: false, message: "Deskripsi, tanggal, dan minimal 2 entri jurnal wajib diisi." };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  const formattedEntries = entries.map(e => {
    const amount = parseFloat(e.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Jumlah harus angka positif.");
    }
    if (e.type === 'debit') totalDebit += amount;
    if (e.type === 'credit') totalCredit += amount;
    return {
      account_id: parseInt(e.accountId),
      amount: amount,
      type: e.type,
    };
  });

  if (totalDebit !== totalCredit) {
    return { success: false, message: "Total Debit dan Kredit tidak seimbang." };
  }

  const supabase = createClient();
  
  // Memanggil fungsi RPC di database
  const { data, error } = await supabase.rpc('create_transaction_with_entries', {
    p_description: description,
    p_date: date,
    p_entries: formattedEntries
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: `Gagal menyimpan transaksi: ${error.message}` };
  }

  revalidatePath('/'); // Refresh data di halaman utama
  return { success: true, message: "Transaksi berhasil disimpan!" };
}