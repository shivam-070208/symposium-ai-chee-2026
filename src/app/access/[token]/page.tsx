import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AccessPage } from "@/components/access/access-page";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Your registration",
  description:
    "Private view of your AI-CHHE 2026 registration status, payment, documents and personal details.",
};

// The private token makes every render unique; nothing here can be prerendered.
export const instant = false;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type AccessRouteProps = {
  readonly params: Promise<{ token: string }>;
};

const AccessRoute = ({ params }: AccessRouteProps) => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <SiteHeader />
    <div className="flex-1">
      <Suspense fallback={<AccessFallback />}>
        <AccessLoader params={params} />
      </Suspense>
    </div>
    <footer className="border-t border-line px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 text-[12px] text-mist sm:flex-row sm:items-center sm:justify-between">
        <span>AI-CHHE 2026 · Department of Civil Engineering, NIT Patna</span>
        <span>Private registration view</span>
      </div>
    </footer>
  </div>
);

const AccessLoader = async ({ params }: AccessRouteProps) => {
  const { token } = await params;

  if (!TOKEN_PATTERN.test(token)) {
    notFound();
  }

  return <AccessPage token={token} />;
};

const AccessFallback = () => (
  <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-8">
    <div className="rounded-2xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
      Opening your registration view…
    </div>
  </div>
);

export default AccessRoute;
