"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdminLoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const login = trpc.admin.login.useMutation({
    onSuccess: () => {
      router.push("/admin");
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    login.mutate({ email, password });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2"
        />
      </div>
      {message ? (
        <p
          role="alert"
          className="rounded-lg border border-errorred/20 bg-errorred/5 px-3 py-2 text-[13px] text-errorred"
        >
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-[44px] w-full"
        disabled={login.isPending}
      >
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
};
