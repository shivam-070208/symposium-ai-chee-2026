import type { ReactNode } from "react";
import { AdminMobileHeader } from "./admin-mobile-header";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  readonly children: ReactNode;
};

export const AdminShell = ({ children }: AdminShellProps) => (
  <div className="flex min-h-screen bg-canvas text-navy">
    <AdminSidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <AdminMobileHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-8 sm:py-9">
        {children}
      </main>
    </div>
  </div>
);
