export type AdminNavItem = {
  readonly href: string;
  readonly label: string;
};

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/emails", label: "Outbox" },
] as const satisfies readonly AdminNavItem[];
