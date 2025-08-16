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

/**
 * Mendapatkan ID workspace yang aktif dari cookie.
 * @returns {Promise<string | null>} ID workspace atau null jika tidak ada.
 */
export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('active_workspace')?.value || null;
}

/**
 * Menangani proses login pengguna.
 * @param {FormData} formData Data form yang berisi email dan password.
 * @returns {Promise<{ success: boolean; message: string }>} Hasil login.
 */
export async function login(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, message: "Email atau password salah." };
  }
  // Setelah login berhasil, arahkan pengguna ke halaman pemilihan workspace
  redirect("/select-workspace");
}

/**
 * Menangani proses logout pengguna.
 */
export async function logout() {
  const supabase = createClient();
  // Hapus cookie workspace saat logout
  cookies().delete('active_workspace');
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Server Action untuk menyimpan ID workspace yang dipilih ke cookie dan melakukan redirect.
 * @param {FormData} formData FormData dari form yang berisi ID workspace.
 */
export async function function_selectWorkspace(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Verifikasi pengguna dan keanggotaan workspace sebelum menyetel cookie
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=Sesi pengguna tidak valid.");
  }

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (error || !member) {
    // Tangani jika pengguna bukan anggota dari workspace yang dipilih
    redirect("/select-workspace?message=Anda tidak memiliki akses ke workspace ini.");
  }
  
  cookieStore.set('active_workspace', workspaceId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 minggu
    httpOnly: true,
  });
  
  revalidatePath('/');
  redirect('/');
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
  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false, message: "Tidak ada workspace yang dipilih." };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Sesi pengguna tidak valid." };
  }

  const { data, error } = await supabase.rpc('create_transaction_with_entries', {
    p_description: description,
    p_date: date,
    p_entries: formattedEntries,
    p_workspace_id: workspaceId,
    p_user_id: user.id,
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: `Gagal menyimpan transaksi: ${error.message}` };
  }

  revalidatePath('/');
  return { success: true, message: "Transaksi berhasil disimpan!" };
}

// Server Action untuk mengubah transaksi
export async function updateJournalTransaction(
  id: number,
  description: string,
  date: string,
  entries: Omit<JournalEntry, 'debit' | 'credit'>[]
): Promise<{ success: boolean; message: string }> {
  if (!id || !description || !date || entries.length < 2) {
    return { success: false, message: "ID, Deskripsi, tanggal, dan minimal 2 entri jurnal wajib diisi." };
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Sesi pengguna tidak valid." };
  }

  const { error } = await supabase.rpc('update_journal_transaction', {
    p_transaction_id: id,
    p_description: description,
    p_date: date,
    p_entries: formattedEntries,
    p_user_id: user.id,
  });

  if (error) {
    console.error("RPC Error:", error);
    return { success: false, message: `Gagal mengubah transaksi: ${error.message}` };
  }

  revalidatePath('/');
  return { success: true, message: "Transaksi berhasil diubah!" };
}

/**
 * Mengambil data transaksi untuk diekspor ke file.
 * @param {string} [startDate] Tanggal mulai.
 * @param {string} [endDate] Tanggal akhir.
 * @returns {Promise<{ success: boolean; data?: any[]; error?: string }>} Hasil operasi.
 */
export async function getTransactionsForExport(startDate?: string, endDate?: string) {
  const supabase = createClient();
  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) {
    return { success: false, error: "Tidak ada workspace yang dipilih." };
  }

  let query = supabase.from("transactions_with_details").select("*")
    .eq('workspace_id', workspaceId)
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