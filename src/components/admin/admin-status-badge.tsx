import { adminStatusClasses, adminStatusLabel } from "./admin-format";

type AdminStatusBadgeProps = {
  readonly status: string;
};

export const AdminStatusBadge = ({ status }: AdminStatusBadgeProps) => (
  <span className={adminStatusClasses(status)}>
    {adminStatusLabel(status)}
  </span>
);
