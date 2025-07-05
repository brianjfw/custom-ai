import { createTRPCRouter } from '../trpc';
import { userRouter } from './user';
import { aiRouter } from './ai';
import { customersRouter } from './customers';
import { jobsRouter } from './jobs';
import { communicationsRouter } from './communications';
import { calendarRouter } from './calendar';
import { financialRouter } from './financial';
import { analyticsRouter } from './analytics';

/**
 * Main application router
 * All routers should be combined here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  ai: aiRouter,
  customers: customersRouter,
  jobs: jobsRouter,
  communications: communicationsRouter,
  calendar: calendarRouter,
  financial: financialRouter,
  analytics: analyticsRouter,
});

// Export the router type for use in the frontend
export type AppRouter = typeof appRouter;