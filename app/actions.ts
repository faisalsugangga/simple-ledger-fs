// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Tipe untuk entri jurnal yang dikirim dari form
type JournalEntry = {
  accountId: string;
  amount: string;
  type: 'debit' | 'credit';
};

// Fungsi untuk mendapatkan ID workspace yang aktif dari cookie
async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('active_workspace')?.value || null;
}

export async function login(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, message: "Email atau password salah." };
  }
  // Setelah login berhasil, arahkan pengguna ke halaman pemilihan workspace
  redirect("/select-workspace"); // <--- PERUBAHAN
}

export async function logout() {
  const supabase = createClient();
  // Hapus cookie workspace saat logout
  cookies().delete('active_workspace'); // <--- PERUBAHAN
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addJournalTransaction(
  description: string,
  date: string,
  entries: JournalEntry[]
): Promise<{ success: boolean; message: string }> {
  
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
  const workspaceId = await getActiveWorkspaceId(); // <--- Dapatkan ID workspace yang aktif
  if (!workspaceId) {
    return { success: false, message: "Tidak ada workspace yang dipilih." };
  }
  
  const { data, error } = await supabase.rpc('create_transaction_with_entries', {
    p_description: description,
    p_date: date,
    p_entries: formattedEntries,
    p_workspace_id: workspaceId // <--- TAMBAHAN: Teruskan workspace_id ke RPC
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: `Gagal menyimpan transaksi: ${error.message}` };
  }

  revalidatePath('/');
  return { success: true, message: "Transaksi berhasil disimpan!" };
}


// FUNGSI BARU: Mengambil data transaksi untuk diekspor
export async function getTransactionsForExport(startDate?: string, endDate?: string) {
  const supabase = createClient();
  const workspaceId = await getActiveWorkspaceId(); // <--- Dapatkan ID workspace yang aktif
  if (!workspaceId) {
    return { success: false, error: "Tidak ada workspace yang dipilih." };
  }

  let query = supabase.from("transactions_with_details").select("*")
    .eq('workspace_id', workspaceId) // <--- TAMBAHAN: Filter berdasarkan workspace_id
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Export Error:", error);
    return { success: false, error: error.message };
  }

  // ... kode formatting data tetap sama
  const formattedData = data.map(tx => {
    const debitEntry = tx.entries.find((e: any) => e.type === 'debit');
    const creditEntry = tx.entries.find((e: any) => e.type === 'credit');
    
    return {
      'Tanggal': new Date(tx.date).toLocaleDateString('id-ID'),
      'Deskripsi': tx.description,
      'Akun Debit': debitEntry ? debitEntry.account_name : 'N/A',
      'Akun Kredit': creditEntry ? creditEntry.account_name : 'N/A',
      'Jumlah': debitEntry ? debitEntry.amount : 0
    };
  });

  return { success: true, data: formattedData };
}