import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { readAdminSession } from "@/server/admin/admin-session";

// The admin console is fully session-gated; it is intentionally a blocking
// route rather than a partially prerendered one.
export const instant = false;

const AdminDashboardLayout = ({ children }: { children: ReactNode }) => (
  <AdminShell>
    <Suspense fallback={<AdminSessionFallback />}>
      <AdminSessionGate>{children}</AdminSessionGate>
    </Suspense>
  </AdminShell>
);

const AdminSessionGate = async ({ children }: { children: ReactNode }) => {
  await connection();
  const session = await readAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <>{children}</>;
};

const AdminSessionFallback = () => (
  <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
    Checking admin session…
  </div>
);

export default AdminDashboardLayout;
