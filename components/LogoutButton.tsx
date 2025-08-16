// components/LogoutButton.tsx
import { logout } from "@/app/actions";
import { Button } from "./ui/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline">Logout</Button>
    </form>
  );
}