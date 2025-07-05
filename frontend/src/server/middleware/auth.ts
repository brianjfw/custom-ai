import { TRPCError } from '@trpc/server';
import { clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';
import { protectedProcedure, adminProcedure, rateLimitedProcedure, publicProcedure, type Context } from '../trpc';

// Enhanced authentication middleware with user details
export const enhancedAuthMiddleware = protectedProcedure.use(async ({ ctx, next }) => {
  // Get user from Clerk
  let user: User | null = null;
  try {
    const clerk = await clerkClient();
    user = await clerk.users.getUser(ctx.userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to authenticate user',
    });
  }

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
      userId: ctx.userId,
    },
  });
});

// Enhanced admin middleware with user details
export const enhancedAdminMiddleware = adminProcedure.use(async ({ ctx, next }) => {
  // Get user from Clerk
  let user: User | null = null;
  try {
    const clerk = await clerkClient();
    user = await clerk.users.getUser(ctx.userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to authenticate user',
    });
  }

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  // Check if user has admin role
  const isAdminUser = user.publicMetadata?.role === 'admin' || 
                     user.privateMetadata?.role === 'admin';

  if (!isAdminUser) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
      userId: ctx.userId,
    },
  });
});

// Create custom rate limiting middleware
export const customRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return publicProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.userId || 'anonymous';
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (userRequests) {
      if (now < userRequests.resetTime) {
        if (userRequests.count >= maxRequests) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `Rate limit exceeded. Try again after ${Math.ceil((userRequests.resetTime - now) / 1000)} seconds.`,
          });
        }
        userRequests.count++;
      } else {
        // Reset window
        userRequests.count = 1;
        userRequests.resetTime = now + windowMs;
      }
    } else {
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      const cutoff = now - windowMs;
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < cutoff) {
          requests.delete(key);
        }
      }
    }

    return next();
  });
};

// Logging middleware for debugging
export const withLogging = publicProcedure.use(async ({ ctx, path, type, next }) => {
  const start = Date.now();
  
  console.log(`[tRPC] ${type} ${path} - Start`);
  
  try {
    const result = await next();
    const duration = Date.now() - start;
    console.log(`[tRPC] ${type} ${path} - Success (${duration}ms)`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[tRPC] ${type} ${path} - Error (${duration}ms):`, error);
    throw error;
  }
});

// Re-export procedures for consistency
export { protectedProcedure, adminProcedure, rateLimitedProcedure, publicProcedure };

// Create enhanced procedures
export const enhancedProtectedProcedure = enhancedAuthMiddleware;
export const enhancedAdminProcedure = enhancedAdminMiddleware;
export const customRateLimitedProcedure = customRateLimit(100, 60000); // 100 requests per minute
export const loggedProcedure = withLogging;