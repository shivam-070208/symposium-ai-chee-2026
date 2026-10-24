type AdminPageHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly children?: React.ReactNode;
};

export const AdminPageHeader = ({
  eyebrow,
  title,
  description,
  children,
}: AdminPageHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-royal">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.03em] text-navy">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-bodytext">
        {description}
      </p>
    </div>
    {children}
  </div>
);
