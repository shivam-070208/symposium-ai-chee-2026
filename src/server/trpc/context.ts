import { headers } from "next/headers";
import { readAdminSession } from "../admin/admin-session.ts";

export const createContext = async () => {
  const [requestHeaders, adminSession] = await Promise.all([
    headers(),
    readAdminSession(),
  ]);

  return {
    headers: requestHeaders,
    adminEmail: adminSession?.email ?? null,
  };
};

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;
