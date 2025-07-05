import { createTRPCRouter } from '../trpc';
import { userRouter } from './user';
import { aiRouter } from './ai';

/**
 * Main application router
 * All routers should be combined here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  ai: aiRouter,
  // Future routers will be added here:
  // conversation: conversationRouter,
  // file: fileRouter,
  // business: businessRouter,
  // analytics: analyticsRouter,
  // integration: integrationRouter,
});

// Export the router type for use in the frontend
export type AppRouter = typeof appRouter;