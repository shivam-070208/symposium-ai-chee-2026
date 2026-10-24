import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { AdminNav } from "./admin-nav";
import { AdminSignOutButton } from "./admin-sign-out-button";

export const AdminMobileHeader = () => (
  <header className="sticky top-0 z-30 border-b border-line bg-white px-5 py-4 lg:hidden">
    <div className="flex items-center justify-between gap-4">
      <Link href="/admin" aria-label="Admin overview">
        <BrandMark markClassName="size-9" />
      </Link>
      <AdminSignOutButton />
    </div>
    <div className="mt-3">
      <AdminNav orientation="horizontal" />
    </div>
  </header>
);
