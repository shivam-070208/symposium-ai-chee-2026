type AdminEmptyProps = {
  readonly message: string;
  readonly detail?: string;
};

export const AdminEmpty = ({ message, detail }: AdminEmptyProps) => (
  <div className="rounded-xl border border-dashed border-line bg-white px-5 py-10 text-center">
    <p className="text-[14px] font-medium text-navy">{message}</p>
    {detail ? <p className="mt-1.5 text-[13px] text-mist">{detail}</p> : null}
  </div>
);
