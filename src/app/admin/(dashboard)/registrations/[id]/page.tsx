import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminRegistrationDetail } from "@/components/admin/admin-registration-detail";

type AdminRegistrationPageProps = {
  readonly params: Promise<{ id: string }>;
};

const AdminRegistrationPage = ({ params }: AdminRegistrationPageProps) => (
  <Suspense fallback={<RegistrationDetailFallback />}>
    <RegistrationDetailLoader params={params} />
  </Suspense>
);

const RegistrationDetailLoader = async ({
  params,
}: AdminRegistrationPageProps) => {
  const { id } = await params;
  const registrationId = Number(id);

  if (!Number.isInteger(registrationId) || registrationId <= 0) {
    notFound();
  }

  return <AdminRegistrationDetail registrationId={registrationId} />;
};

const RegistrationDetailFallback = () => (
  <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
    Loading registration…
  </div>
);

export default AdminRegistrationPage;
