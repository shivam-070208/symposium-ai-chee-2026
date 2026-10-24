import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { BrandMark } from "@/components/brand/brand-mark";
import { readAdminSession } from "@/server/admin/admin-session";

export const metadata: Metadata = {
  title: "Admin sign in",
};

const AdminLoginPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
    <Suspense fallback={null}>
      <RedirectIfSignedIn />
    </Suspense>
    <div className="w-full max-w-[420px]">
      <div className="rounded-xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(11,31,68,0.04)] sm:p-8">
        <BrandMark markClassName="size-11" />
        <h1 className="mt-6 text-[26px] font-bold tracking-[-0.03em] text-navy">
          Admin sign in
        </h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-bodytext">
          Manage registrations, payments and email delivery.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
      <p className="mt-4 text-center text-[13px]">
        <Link
          href="/"
          className="font-medium text-royal transition-colors hover:text-navy"
        >
          Back to the symposium site
        </Link>
      </p>
    </div>
  </main>
);

const RedirectIfSignedIn = async () => {
  await connection();
  const session = await readAdminSession();

  if (session) {
    redirect("/admin");
  }

  return null;
};

export default AdminLoginPage;
