import { headers } from "next/headers";

export const createContext = async () => ({
  headers: await headers(),
});

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;
