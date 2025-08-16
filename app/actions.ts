// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Fungsi login sekarang mengembalikan Promise dengan status sukses/gagal
export async function login(formData: FormData): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, message: "Email atau password salah." };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Login berhasil!" };
}

// Fungsi logout tetap sama
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Aksi baru untuk menghapus kategori
export async function deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return { success: false, message: 'Gagal menghapus kategori.' };
  }

  revalidatePath('/categories');
  return { success: true, message: 'Kategori berhasil dihapus.' };
}