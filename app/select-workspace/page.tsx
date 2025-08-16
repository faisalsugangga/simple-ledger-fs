"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { selectWorkspace } from "@/app/actions";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

export default function SelectWorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Ambil data workspace di sisi klien
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspaces(id, name, owner_id), role")
        .eq("user_id", user.id);

      if (error) {
        toast.error("Gagal mengambil daftar workspace: " + error.message);
        setIsLoading(false);
        return;
      }
      
      const userWorkspaces = data.map((member: any) => ({
        id: member.workspaces.id,
        name: member.workspaces.name,
        role: member.role,
      }));

      setWorkspaces(userWorkspaces);
      setIsLoading(false);
      
      // Jika hanya ada satu workspace, langsung panggil server action
      if (userWorkspaces.length === 1) {
        const formData = new FormData();
        formData.append('workspaceId', userWorkspaces[0].id);
        await selectWorkspace(formData);
      }
    };

    fetchWorkspaces();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pilih Workspace</CardTitle>
          <CardDescription>Pilih salah satu workspace untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaces.length === 0 ? (
            <p className="text-muted-foreground">Anda belum menjadi anggota di workspace mana pun. Silakan hubungi admin.</p>
          ) : (
            workspaces.map((ws) => (
              <form action={selectWorkspace} key={ws.id}>
                <input type="hidden" name="workspaceId" value={ws.id} />
                <Button
                  type="submit"
                  className="w-full h-auto py-4 text-left justify-start"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{ws.name}</h3>
                    <p className="text-sm text-primary-foreground/80">Role: {ws.role}</p>
                  </div>
                </Button>
              </form>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}