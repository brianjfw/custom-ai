import { createTRPCRouter } from '../trpc';
import { userRouter } from './user';

/**
 * Main application router
 * All routers should be combined here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  // Future routers will be added here:
  // conversation: conversationRouter,
  // file: fileRouter,
  // ai: aiRouter,
  // business: businessRouter,
  // analytics: analyticsRouter,
  // integration: integrationRouter,
});

// Export the router type for use in the frontend
export type AppRouter = typeof appRouter;