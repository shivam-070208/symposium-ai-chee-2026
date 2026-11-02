import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminAbstractDetail } from "@/components/admin/admin-abstract-detail";

type AdminAbstractPageProps = {
  readonly params: Promise<{ id: string }>;
};

const AdminAbstractPage = ({ params }: AdminAbstractPageProps) => (
  <Suspense fallback={<AbstractDetailFallback />}>
    <AbstractDetailLoader params={params} />
  </Suspense>
);

const AbstractDetailLoader = async ({
  params,
}: AdminAbstractPageProps) => {
  const { id } = await params;
  const abstractId = Number(id);

  if (!Number.isInteger(abstractId) || abstractId <= 0) {
    notFound();
  }

  return <AdminAbstractDetail abstractId={abstractId} />;
};

const AbstractDetailFallback = () => (
  <div className="rounded-xl border border-line bg-white px-5 py-10 text-center text-[13px] text-mist">
    Loading abstract…
  </div>
);

export default AdminAbstractPage;
