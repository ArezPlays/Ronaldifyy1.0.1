import { createTRPCClient, httpLink } from "@trpc/client";
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

const trpcUrl = `${getBaseUrl()}/api/trpc`;

let trpcReactClientInstance: ReturnType<typeof trpc.createClient> | null = null;

try {
  trpcReactClientInstance = trpc.createClient({
    links: [
      httpLink({
        url: trpcUrl,
        transformer: superjson,
      }),
    ],
  });
  console.log('[TRPC] React client created successfully');
} catch (error: any) {
  console.log('[TRPC] React client creation error:', error?.message || error);
  trpcReactClientInstance = trpc.createClient({
    links: [
      httpLink({
        url: 'https://localhost:3000/api/trpc',
        transformer: superjson,
      }),
    ],
  });
}

export const trpcReactClient = trpcReactClientInstance!;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
    }),
  ],
});

console.log('[TRPC] Vanilla client created, url:', trpcUrl);
