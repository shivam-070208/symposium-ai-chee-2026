import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/root";

// Reading headers in the context also keeps this endpoint dynamic.
const handleTRPCRequest = (request: NextRequest): Promise<Response> =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] ${error.code} on ${path ?? "<unknown path>"}: ${error.message}`);
    },
  });

export { handleTRPCRequest as GET, handleTRPCRequest as POST };
