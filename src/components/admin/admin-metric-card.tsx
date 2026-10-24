type AdminMetricCardProps = {
  readonly label: string;
  readonly value: number | string;
  readonly note?: string;
  readonly tone?: "default" | "warning";
};

const toneClasses = {
  default: "text-navy",
  warning: "text-errorred",
} as const;

export const AdminMetricCard = ({
  label,
  value,
  note,
  tone = "default",
}: AdminMetricCardProps) => (
  <div className="rounded-xl border border-line bg-white p-5">
    <p className="text-[12px] font-medium text-mist">{label}</p>
    <p
      className={`mt-2 text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums ${toneClasses[tone]}`}
    >
      {value}
    </p>
    {note ? <p className="mt-1.5 text-[12px] text-mist">{note}</p> : null}
  </div>
);
