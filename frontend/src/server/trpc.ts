import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import superjson from 'superjson';

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Lazy load the database connection to avoid build-time errors
let dbInstance: NeonHttpDatabase<Record<string, never>> | null = null;
const getDb = async (): Promise<NeonHttpDatabase<Record<string, never>>> => {
  if (!dbInstance) {
    const { db } = await import('@/db');
    dbInstance = db;
  }
  return dbInstance;
};

/**
 * Context for tRPC procedures
 * This is what you'll use to access the database, session, etc.
 */
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { userId } = await auth();

  return {
    db: await getDb(),
    userId,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error &&
          error.cause.name === 'ZodError'
            ? error.cause.message
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Ensure userId is non-null
    },
  });
});

/**
 * Middleware for rate limiting (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export const rateLimitedProcedure = publicProcedure.use(({ ctx, next }) => {
  // Get IP address from various possible headers
  const getClientIP = (req: NextRequest): string => {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    
    return forwarded || realIP || remoteAddr || 'anonymous';
  };

  const key = ctx.userId || getClientIP(ctx.req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  const current = rateLimitMap.get(key);
  
  if (!current || now - current.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
  } else {
    current.count++;
    if (current.count > maxRequests) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }
  }

  return next();
});

/**
 * Admin procedure that requires specific permissions
 * This can be extended based on business requirements
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // For now, we'll implement a basic admin check
  // In production, this would check user roles from the database
  const isAdmin = ctx.userId === process.env.ADMIN_USER_ID;
  
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});