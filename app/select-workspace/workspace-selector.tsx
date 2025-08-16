"use client";

import { useState } from "react";
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

export default function WorkspaceSelector({ workspaces }: { workspaces: Workspace[] }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSelectWorkspace = async (workspaceId: string) => {
    setIsRedirecting(true);
    try {
      await selectWorkspace(workspaceId);
    } catch (error) {
      console.error("Failed to select workspace:", error);
      toast.error("Gagal memilih workspace. Silakan coba lagi.");
      setIsRedirecting(false);
    }
  };
  
  if (workspaces.length === 0) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Pilih Workspace</CardTitle>
          <CardDescription>Pilih salah satu workspace untuk melanjutkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Anda belum menjadi anggota di workspace mana pun. Silakan hubungi admin.</p>
        </CardContent>
      </Card>
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
            {workspaces.map((ws) => (
              <Button
                key={ws.id}
                onClick={() => handleSelectWorkspace(ws.id)}
                className="w-full h-auto py-4 text-left justify-start"
                disabled={isRedirecting}
              >
                <div>
                  <h3 className="font-semibold text-lg">{ws.name}</h3>
                  <p className="text-sm text-primary-foreground/80">Role: {ws.role}</p>
                </div>
                {isRedirecting && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            ))}
          </CardContent>
        </Card>
    </main>
  );
}