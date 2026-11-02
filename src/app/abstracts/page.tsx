import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { AbstractsPage } from "@/components/abstracts/abstracts-page";

export const metadata: Metadata = {
  title: "Call for Abstracts",
  description:
    "Submit an abstract for AI-CHHE 2026 at the Department of Civil Engineering, National Institute of Technology Patna.",
};

const AbstractsRoute = () => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <SiteHeader />
    <div className="flex-1">
      <AbstractsPage />
    </div>
    <footer className="border-t border-line px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 text-[12px] text-mist sm:flex-row sm:items-center sm:justify-between">
        <span>AI-CHHE 2026 · Department of Civil Engineering, NIT Patna</span>
        <span>Abstract submission</span>
      </div>
    </footer>
  </div>
);

export default AbstractsRoute;
