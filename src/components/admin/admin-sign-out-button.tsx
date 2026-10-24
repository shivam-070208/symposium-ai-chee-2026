"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type AdminSignOutButtonProps = {
  readonly className?: string;
};

export const AdminSignOutButton = ({ className }: AdminSignOutButtonProps) => {
  const router = useRouter();
  const signOut = trpc.admin.logout.useMutation({
    onSuccess: () => {
      router.replace("/admin/login");
      router.refresh();
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={signOut.isPending}
      onClick={() => signOut.mutate()}
      className={cn("w-full justify-center", className)}
    >
      {signOut.isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
};
