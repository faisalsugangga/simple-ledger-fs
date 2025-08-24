// app/select-workspace/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { selectWorkspace } from "@/app/actions";

// Definisikan tipe untuk data yang akan diterima
interface WorkspaceMember {
  workspaces: {
    id: string;
    name: string;
  } | null;
  role: string;
}

export default async function SelectWorkspacePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name), role")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching workspaces:", error);
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-red-500">Gagal memuat daftar workspace: {error.message}</p>
      </main>
    );
  }

  const userWorkspaces = (data || [])
    .filter((member: WorkspaceMember) => member.workspaces !== null)
    .map((member: WorkspaceMember) => ({
      id: member.workspaces!.id,
      name: member.workspaces!.name,
      role: member.role,
    }));


  if (userWorkspaces.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Pilih Workspace</CardTitle>
            <CardDescription>Pilih salah satu workspace untuk melanjutkan.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Anda belum menjadi anggota di workspace mana pun. Silakan hubungi admin.</p>
          </CardContent>
        </Card>
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
          {userWorkspaces.map((ws) => (
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
          ))}
        </CardContent>
      </Card>
    </main>
  );
}