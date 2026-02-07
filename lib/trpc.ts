import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.warn('[TRPC] EXPO_PUBLIC_RORK_API_BASE_URL is not set, using fallback');
    return 'https://localhost:3000';
  }
  return url;
};

let trpcClientInstance: ReturnType<typeof trpc.createClient> | null = null;

try {
  trpcClientInstance = trpc.createClient({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
  console.log('[TRPC] Client created successfully');
} catch (error: any) {
  console.log('[TRPC] Client creation error:', error?.message || error);
  trpcClientInstance = trpc.createClient({
    links: [
      httpLink({
        url: 'https://localhost:3000/api/trpc',
        transformer: superjson,
      }),
    ],
  });
}

export const trpcClient = trpcClientInstance!;
