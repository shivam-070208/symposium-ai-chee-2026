import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { AdminNav } from "./admin-nav";
import { AdminSignOutButton } from "./admin-sign-out-button";

export const AdminSidebar = () => (
  <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-white px-5 py-6 lg:flex">
    <Link
      href="/admin"
      aria-label="Admin overview"
      className="transition-opacity hover:opacity-80"
    >
      <BrandMark markClassName="size-10" />
    </Link>
    <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
      Admin console
    </p>
    <div className="mt-3 flex-1">
      <AdminNav orientation="vertical" />
    </div>
    <div className="border-t border-line pt-5">
      <AdminSidebarSession />
    </div>
  </aside>
);

const AdminSidebarSession = () => (
  <div className="space-y-3">
    <p className="text-[12px] text-mist">Signed in as administrator</p>
    <AdminSignOutButton />
  </div>
);
