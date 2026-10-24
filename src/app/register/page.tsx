import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { RegisterPage } from "@/components/registration/register-page";

export const metadata: Metadata = {
  title: "Registration",
  description:
    "Register as a delegate for AI-CHHE 2026 at the Department of Civil Engineering, National Institute of Technology Patna.",
};

const RegisterRoute = () => (
  <div className="flex min-h-screen flex-col bg-canvas">
    <SiteHeader />
    <div className="flex-1">
      <RegisterPage />
    </div>
    <footer className="border-t border-line px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 text-[12px] text-mist sm:flex-row sm:items-center sm:justify-between">
        <span>AI-CHHE 2026 · Department of Civil Engineering, NIT Patna</span>
        <span>Registration form</span>
      </div>
    </footer>
  </div>
);

export default RegisterRoute;
