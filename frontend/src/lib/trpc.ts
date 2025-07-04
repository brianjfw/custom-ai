import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/server/routers/_app';
import superjson from 'superjson';

/**
 * Create the tRPC React hooks
 * This will be used throughout the frontend to call tRPC procedures
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for tRPC requests
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // SSR should use Vercel URL
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create a vanilla tRPC client (for use outside of React components)
 */
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        return {
          // Add any global headers here
        };
      },
    }),
  ],
});

/**
 * Inference helpers for TypeScript
 */
export type RouterInputs = Parameters<AppRouter['createCaller']>[0];
export type RouterOutputs = ReturnType<AppRouter['createCaller']>;

/**
 * Type helpers for specific router outputs
 */
export type UserProfile = RouterOutputs['user']['getProfile'];
export type UserStats = RouterOutputs['user']['getStats'];
export type User = RouterOutputs['user']['me'];